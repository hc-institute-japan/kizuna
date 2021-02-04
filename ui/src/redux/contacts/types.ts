import { Profile } from "../profile/types";

export const SET_CONTACTS = "SET_CONTACTS";

export interface IndexedContacts {
  [key: string]: Profile[];
}

export interface ContactsState {
  contacts: Profile[];
  blocked: Profile[];
  indexedContacts: IndexedContacts;
}

interface SetContactsAction {
  type: typeof SET_CONTACTS;
  contacts: Profile[];
}

export type ContactsActionType = SetContactsAction;
