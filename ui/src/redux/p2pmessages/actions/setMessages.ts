import { ThunkAction } from "../../types";
import { P2PMessageConversationState, SET_MESSAGES } from "../types";

/*
    set P2PMessageConversations into the redux state
*/
export const setMessages =
  (state: P2PMessageConversationState): ThunkAction =>
  (dispatch, getState) => {
    // get state
    let currentState = { ...getState().p2pmessages };
    let { conversations, messages, receipts } = state;

    for (const [key, value] of Object.entries(conversations)) {
      let existing = currentState.conversations[key];
      if (existing === undefined) {
        currentState.conversations[key] = {
          messages: value.messages,
          pinned: [],
        };
      } else
        currentState.conversations[key] = {
          messages: [...new Set(existing.messages.concat(value.messages))],
          pinned: [],
        };
    }
    currentState.messages = {
      ...currentState.messages,
      ...messages,
    };
    currentState.receipts = {
      ...currentState.receipts,
      ...receipts,
    };

    dispatch({
      type: SET_MESSAGES,
      state: currentState,
    });
    return true;
  };
