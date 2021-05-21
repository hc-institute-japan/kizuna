import { timestampToDate, Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { APPEND_RECEIPT } from "../../types";

const receiveP2PReceipt = (payload: any): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  let receiptHash = Object.keys(payload.receipt)[0];

  let messageIDs: string[] = [];
  payload.receipt[receiptHash].id.forEach((id: Uint8Array) => {
    messageIDs.push("u" + Uint8ArrayToBase64(id));
  });

  let p2pReceipt = {
    p2pMessageReceiptEntryHash: receiptHash,
    p2pMessageEntryHashes: messageIDs,
    timestamp: timestampToDate(payload.receipt[receiptHash].status.timestamp),
    status: payload.receipt[receiptHash].status.status,
  };

  dispatch({
    type: APPEND_RECEIPT,
    state: p2pReceipt,
  });
};

export default receiveP2PReceipt;
