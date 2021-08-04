import {
  ADD_GROUP,
  ADD_MEMBERS,
  GroupConversationsActionTypes,
  GroupConversationsState,
  REMOVE_MEMBERS,
  SET_CONVERSATIONS,
  SET_FILES_BYTES,
  SET_GROUP_MESSAGE,
  SET_GROUP_MESSAGES,
  SET_GROUP_READ_MESSAGE,
  SET_GROUP_TYPING_INDICATOR,
  SET_LATEST_GROUP_STATE,
  SET_PINNED_MESSAGES,
  UPDATE_GROUP_NAME,
} from "./types";

const initialState: GroupConversationsState = {
  conversations: {},
  messages: {},
  groupFiles: {},
  members: {},
  typing: {},
  pinnedMessages: {},
};

const reducer = (
  state = initialState,
  action: GroupConversationsActionTypes
) => {
  switch (action.type) {
    case ADD_GROUP: {
      return {
        ...state,
        conversations: action.conversations,
        members: action.members,
      };
    }
    case ADD_MEMBERS: {
      return {
        ...state,
        conversations: action.conversations,
        members: action.members,
      };
    }
    case REMOVE_MEMBERS: {
      return {
        ...state,
        conversations: action.conversations,
        members: action.members,
      };
    }
    case UPDATE_GROUP_NAME: {
      return { ...state, conversations: action.conversations };
    }
    case SET_GROUP_MESSAGE: {
      return {
        ...state,
        conversations: action.conversations,
        messages: action.messages,
        groupFiles: action.groupFiles,
      };
    }
    case SET_FILES_BYTES:
      return {
        ...state,
        groupFiles: action.filesBytes,
      };
    case SET_GROUP_MESSAGES: {
      return {
        ...state,
        messages: action.messages,
        conversations: action.conversations,
      };
    }
    case SET_LATEST_GROUP_STATE: {
      return {
        ...state,
        conversations: action.conversations,
        messages: action.messages,
        members: action.members,
      };
    }
    case SET_GROUP_TYPING_INDICATOR: {
      return { ...state, typing: action.typing };
    }
    case SET_GROUP_READ_MESSAGE: {
      return { ...state, messages: { ...action.messages } };
    }
    case SET_PINNED_MESSAGES: {
      const { conversations, pinnedMessages } = action;
      return {
        ...state,
        conversations,
        pinnedMessages,
      };
    }
    case SET_CONVERSATIONS: {
      const { conversations } = action;
      return {
        ...state,
        conversations,
      };
    }
    default:
      return state;
  }
};

export default reducer;
