import {
  ContactsActionType,
  ContactsState,
  SET_BLOCKED,
  SET_CONTACTS,
} from "./types";

const initialState: ContactsState = {
  contacts: {},
  blocked: {},
};

const reducer = (state = initialState, action: ContactsActionType) => {
  switch (action.type) {
    case SET_CONTACTS:
      return { ...state, contacts: action.contacts };
    case SET_BLOCKED:
      return { ...state, blocked: action.blocked };
    default:
      return state;
  }
};

export default reducer;
