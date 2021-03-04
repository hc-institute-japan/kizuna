import { Profile } from "../profile/types";

export const SET_CONTACTS = "SET_CONTACTS";
export const SET_BLOCKED = "SET_BLOCKED";

export interface IndexedContacts {
  [key: string]: Profile[];
}

export interface ContactsState {
  contacts: {
    [key: string]: Profile;
  };
  blocked: {
    [key: string]: Profile;
  };
}

interface SetContactsAction {
  type: typeof SET_CONTACTS;
  contacts: {
    [key: string]: Profile;
  };
}

interface SetBlockedAction {
  type: typeof SET_BLOCKED;
  blocked: {
    [key: string]: Profile;
  };
}
export type ContactsActionType = SetContactsAction | SetBlockedAction;
