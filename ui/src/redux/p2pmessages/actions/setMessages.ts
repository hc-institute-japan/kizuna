import { ThunkAction } from "../../types";
import { P2PMessageConversationState, SET_MESSAGES } from "../types";

/*
    set P2PMessageConversations into the redux state
*/
export const setMessages =
  (state: P2PMessageConversationState): ThunkAction =>
  (dispatch) => {
    dispatch({
      type: SET_MESSAGES,
      state,
    });
    return true;
  };
