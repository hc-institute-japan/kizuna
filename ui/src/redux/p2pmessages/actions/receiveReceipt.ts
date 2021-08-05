import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { P2PReceiptRaw, APPEND_RECEIPT } from "../types";
import { timestampToDate } from "../../../utils/helpers";

export const receiveReceipt =
  (receipt: P2PReceiptRaw): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    let input = {
      id: receipt.id,
      status: receipt.status,
    };

    console.log("receive receipt action input", input);

    const deliveredReceipt = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].RECEIVE_DELIVERED_RECEIPT,
      payload: input,
    });

    if (deliveredReceipt?.type !== "error") {
      console.log("receive receipt action", deliveredReceipt);
      let [key] = Object.keys(deliveredReceipt);

      let messageIDs: string[] = [];
      deliveredReceipt[key].id.forEach((id: Uint8Array) => {
        messageIDs.push(serializeHash(id));
      });

      let p2preceipt = {
        p2pMessageReceiptEntryHash: key,
        p2pMessageEntryHashes: messageIDs,
        timestamp: timestampToDate(deliveredReceipt[key].status.timestamp),
        status: deliveredReceipt[key].status.status,
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
