import { ContactsActionType, ContactsState, SET_CONTACTS } from "./types";

const initialState: ContactsState = {
  contacts: {},
  blocked: {},
};

const reducer = (state = initialState, action: ContactsActionType) => {
  switch (action.type) {
    case SET_CONTACTS:
      return { ...state, contacts: action.contacts };
    default:
      return state;
  }
};

export default reducer;
