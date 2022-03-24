import { Profile } from "../profile/types";

export const SET_CONTACTS = "SET_CONTACTS";
export const SET_BLOCKED = "SET_BLOCKED";

export interface IndexedContacts {
  [key: string]: Profile[];
}

export interface Category {
  id: string;
  name: string;
}

export interface ContactOutput {
  id: string; // AgentPubKkeyb64
  firstName?: string;
  lastName?: string;
  category?: Category;
}

export interface ContactsState {
  contacts: {
    [key: string]: Profile;
  };
  blocked: {
    [key: string]: Profile;
  };
  // categories: {
  //   [key: string]: Category;
  // };
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

// use this type for contacts once alias an categories are implemented
// export interface Contact {
//   id: AgentPubKey;
//   username: string;
//   fields: {
//     [key: string]: any;
//   };
//   firstName?: string;
//   lastName?: string;
//   category?: Category;
// }
