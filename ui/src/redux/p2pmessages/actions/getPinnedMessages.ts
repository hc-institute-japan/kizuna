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
    console.log("getting pinned messages", conversant);
    let zome_input = {
      conversant: Buffer.from(deserializeHash(conversant)),
    };
    console.log("zome input", zome_input);
    try {
      // CALL ZOME
      const pinnedMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_PINNED_MESSAGES,
        payload: Buffer.from(deserializeHash(conversant)),
      });

      // DISPATCH TO REDUCER
      if (pinnedMessages?.type !== "error") {
        // console.log("pinned messages", pinnedMessages);
        const contactsState = { ...getState().contacts.contacts };
        const profile = { ...getState().profile };
        const profileList = {
          ...contactsState,
          [profile.id!]: { id: profile.id!, username: profile.username! },
        };
        let toDispatch = transformZomeDataToUIData(pinnedMessages, profileList);
        console.log("todispatch", toDispatch);

        dispatch({
          type: SET_PINNED,
          state: { conversant: conversant, messages: toDispatch.messages },
        });

        return toDispatch;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
