import { ThunkAction } from "../../types";
import { P2PMessageReceipt, SET_RECEIPTS } from "../types";

/*
    append a receipt into the redux state 
    after receving a signal (e.g., message has been read)
*/
export const appendReceipt =
  (state: P2PMessageReceipt): ThunkAction =>
  async (dispatch, getState) => {
    let currentState = { ...getState().p2pmessages };

    let receipt = state;
    let receiptHash = state.p2pMessageReceiptEntryHash;

    receipt.p2pMessageEntryHashes.forEach((hash) => {
      if (currentState.messages[hash] !== undefined) {
        currentState.messages[hash].receipts.push(receiptHash);
      }
    });

    currentState.receipts = {
      ...currentState.receipts,
      [receiptHash]: receipt,
    };

    dispatch({
      type: SET_RECEIPTS,
      state: currentState.receipts,
    });

    return true;
  };
