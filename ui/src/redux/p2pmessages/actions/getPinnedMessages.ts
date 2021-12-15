import { deserializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import { AgentPubKeyBase64, SET_PINNED } from "../types";
import { transformZomeDataToUIData } from "./helpers/transformZomeDateToUIData";

// action to get all pinned messages
export const getPinnedMessages =
  (conversant: AgentPubKeyBase64): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    try {
      // CALL ZOME
      const pinnedMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_PINNED_MESSAGES,
        payload: Buffer.from(deserializeHash(conversant)),
      });

      // DISPATCH TO REDUCER
      if (pinnedMessages?.type !== "error") {
        const contactsState = { ...getState().contacts.contacts };
        const profile = { ...getState().profile };
        const profileList = {
          ...contactsState,
          [profile.id!]: {
            id: profile.id!,
            username: profile.username!,
            fields: profile.fields,
          },
        };
        const toDispatch = transformZomeDataToUIData(
          pinnedMessages,
          profileList
        );

        let currentState = { ...getState().p2pmessages };

        if (currentState.conversations[conversant] === undefined) {
          currentState.conversations[conversant] = {
            messages: [],
            pinned: [],
          };
          for (const [key, value] of Object.entries(toDispatch.messages)) {
            if (!currentState.conversations[conversant].pinned.includes(key)) {
              currentState.conversations[conversant].pinned.push(key);
            }
            if (currentState.pinned[key] === undefined) {
              currentState.pinned[key] = value;
            } else {
              continue;
            }
          }
        } else {
          if (currentState.conversations[conversant].pinned === undefined) {
            currentState.conversations[conversant].pinned = [];
            for (const [key, value] of Object.entries(toDispatch.messages)) {
              if (
                !currentState.conversations[conversant].pinned.includes(key)
              ) {
                currentState.conversations[conversant].pinned.push(key);
              }
              if (currentState.pinned[key] === undefined) {
                currentState.pinned[key] = value;
              } else {
                continue;
              }
            }
          } else {
            for (const [key, value] of Object.entries(toDispatch.messages)) {
              if (
                !currentState.conversations[conversant].pinned.includes(key)
              ) {
                currentState.conversations[conversant].pinned.push(key);
              }
              if (currentState.pinned[key] === undefined) {
                currentState.pinned[key] = value;
              } else {
                continue;
              }
            }
          }
        }

        dispatch({
          type: SET_PINNED,
          state: currentState,
        });
        // dispatch({
        //   type: SET_PINNED,
        //   state: { conversant: conversant, messages: toDispatch.messages },
        // });

        return toDispatch;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
