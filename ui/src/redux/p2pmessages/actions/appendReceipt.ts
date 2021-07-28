import { ThunkAction } from "../../types";
import { P2PMessageReceipt, APPEND_RECEIPT } from "../types";

/*
    append a receipt into the redux state 
    after receving a signal (e.g., message has been read)
*/
export const appendReceipt =
  (state: P2PMessageReceipt): ThunkAction =>
  async (dispatch) => {
    dispatch({
      type: APPEND_RECEIPT,
      state,
    });
    return true;
  };
