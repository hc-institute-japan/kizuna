import { PreferenceAction, PreferenceState, SET_PREFERENCE } from "./types";

const initialState: PreferenceState = {
  readReceipt: false,
  typingIndicator: false,
  agentReadReceipt: {},
  agentTypingIndicator: {},
  groupReadReceipt: {},
  groupTypingIndicator: {},
};

const reducer = (state = initialState, action: PreferenceAction) => {
  switch (action.type) {
    case SET_PREFERENCE:
      return {
        ...state,
        ...action.preference,
      };
    default:
      return state;
  }
};

export default reducer;
