import { ThunkAction } from "../../types";
import {
  P2PMessage,
  P2PMessageReceipt,
  P2PFile,
  APPEND_MESSAGE,
} from "../types";

/*
    append a message, receipt, file bytes [no fetch] into the redux after a user sends a message
    append a message, receipt, file bytes [with fetch] into the redux after a receiver receives a signal
*/
export const appendMessage =
  (state: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
    file?: P2PFile;
  }): ThunkAction =>
  async (dispatch) => {
    dispatch({
      type: APPEND_MESSAGE,
      state,
    });
    return true;
  };
