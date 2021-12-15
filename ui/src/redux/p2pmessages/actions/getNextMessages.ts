import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { AgentPubKeyBase64, HoloHashBase64 } from "../types";
import { transformZomeDataToUIData } from "./helpers/transformZomeDateToUIData";

// action to get messages in batches (called while scrolling in chat boxes and media boxes)
export const getNextMessages =
  (
    conversant: AgentPubKeyBase64,
    batch_size: number,
    payload_type: String,
    last_fetched_timestamp?: Date,
    last_fetched_message_id?: HoloHashBase64
  ): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let zome_input = {
      conversant: Buffer.from(deserializeHash(conversant)),
      batch_size: batch_size,
      payload_type: payload_type,
      last_fetched_timestamp: last_fetched_timestamp
        ? dateToTimestamp(last_fetched_timestamp)
        : undefined,
      last_fetched_message_id: last_fetched_message_id
        ? Buffer.from(deserializeHash(last_fetched_message_id))
        : undefined,
    };
    try {
      // CALL ZOME
      const nextBatchOfMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_MESSAGES,
        payload: zome_input,
      });

      // DISPATCH TO REDUCER
      if (nextBatchOfMessages?.type !== "error") {
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
        let toDispatch = transformZomeDataToUIData(
          nextBatchOfMessages,
          profileList
        );
        return toDispatch;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
