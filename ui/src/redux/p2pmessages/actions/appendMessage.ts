import { ThunkAction } from "../../types";
import { P2PMessage, P2PMessageReceipt, P2PFile, SET_MESSAGES } from "../types";

/*
    append a message, receipt, file bytes [no fetch] into the redux after a user sends a message
    append a message, receipt, file bytes [with fetch] into the redux after a receiver receives a signal
*/
export const appendMessage =
  (state: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
    file?: P2PFile;
    key?: string;
  }): ThunkAction =>
  async (dispatch, getState) => {
    let currentState = { ...getState().p2pmessages };

    const conversantID = state.key ? state.key : state.message.receiver.id;
    const messageHash = state.message.p2pMessageEntryHash;
    const receiptHash = state.receipt.p2pMessageReceiptEntryHash;

    if (currentState.conversations[conversantID]) {
      currentState.conversations[conversantID] = {
        pinned: [...currentState.conversations[conversantID].pinned],
        messages: [
          messageHash,
          ...currentState.conversations[conversantID].messages,
        ],
      };
    } else {
      currentState.conversations[conversantID] = {
        messages: [messageHash],
        pinned: [],
      };
    }

    if (state.file)
      currentState.files[state.file.fileHash] = state.file.fileBytes;

    currentState.messages = {
      ...currentState.messages,
      [messageHash]: state.message,
    };

    currentState.receipts = {
      ...currentState.receipts,
      [receiptHash]: state.receipt,
    };

    dispatch({
      type: SET_MESSAGES,
      state: currentState,
    });

    return true;
  };
