import { indexContacts } from "../../utils/helpers";
import { Profile } from "../../redux/profile/types";
import {
  ContactsActionType,
  ContactsState,
  IndexedContacts,
  SET_CONTACTS,
} from "./types";

const initialState: ContactsState = {
  contacts: [],
  indexedContacts: {},
  blocked: [],
};

const reducer = (state = initialState, action: ContactsActionType) => {
  switch (action.type) {
    case SET_CONTACTS:
      const contacts = action.contacts.sort((a: Profile, b: Profile) => {
        const profileA = a.username.toLowerCase();
        const profileB = b.username.toLowerCase();
        return profileA < profileB ? -1 : profileA > profileB ? 1 : 0;
      });

      let indexedContacts: IndexedContacts = indexContacts(contacts);

      return { ...state, contacts, indexedContacts };
    default:
      return state;
  }
};

export default reducer;
