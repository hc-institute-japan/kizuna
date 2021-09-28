import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { P2PMessage, APPEND_RECEIPT } from "../types";
import { dateToTimestamp, timestampToDate } from "../../../utils/helpers";

export const readMessage =
  (messages: P2PMessage[]): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    // CONSTRUCT ZOME INPUT
    // construct the timestamp
    let now = new Date();
    let timestamp = dateToTimestamp(now);

    // get hashes of messages to be marked
    let hashes: any = [];
    messages.map((message) =>
      hashes.push(deserializeHash(message.p2pMessageEntryHash))
    );

    // get the sender (sender = conversant since p2p)
    let sender = Buffer.from(deserializeHash(messages[0].author.id));

    let input = {
      message_hashes: hashes,
      sender: sender,
      timestamp: timestamp,
    };

    // CALL ZOME
    const readReceiptMap = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].READ_MESSAGE,
      payload: input,
    });

    // DISPATCH TO REDUCER
    if (readReceiptMap?.type !== "error") {
      let [key] = Object.keys(readReceiptMap);

      let messageIDs: string[] = [];
      readReceiptMap[key].id.forEach((id: Uint8Array) => {
        messageIDs.push(serializeHash(id));
      });

      let p2preceipt = {
        p2pMessageReceiptEntryHash: key,
        p2pMessageEntryHashes: messageIDs,
        timestamp: timestampToDate(readReceiptMap[key].status.timestamp),
        status: readReceiptMap[key].status.status,
      };

      dispatch({
        type: APPEND_RECEIPT,
        state: p2preceipt,
      });
      return true;
    }

    // ERROR
    return false;
  };
