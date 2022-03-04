import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/HolochainService/types";
import {
  dateToTimestamp,
  timestampToDate,
} from "../../../utils/services/DateService";
import { ThunkAction } from "../../types";
import { P2PMessage } from "../types";

import { appendReceipt } from "./appendReceipt";

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

      let p2pReceipt = {
        p2pMessageReceiptEntryHash: key,
        p2pMessageEntryHashes: messageIDs,
        timestamp: timestampToDate(readReceiptMap[key].status.timestamp),
        status: readReceiptMap[key].status.status,
      };

      dispatch(appendReceipt(p2pReceipt));
      return true;
    }

    // ERROR
    return false;
  };
