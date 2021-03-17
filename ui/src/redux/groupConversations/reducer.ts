import {
  GroupConversationsActionTypes,
  GroupConversationsState,
  SET_CONVERSATIONS,
  SET_MESSAGES,
} from "./types";

const initialState: GroupConversationsState = {
  conversations: {},
  messages: {},
  fileBytes: {},
};

const groupConversationsReducer = (
  state = initialState,
  action: GroupConversationsActionTypes
) => {
  switch (action.type) {
    case SET_CONVERSATIONS:
      return {
        ...state,
        conversations: action.conversations,
      };
    case SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    default:
      return state;
  }
};

export default groupConversationsReducer;
