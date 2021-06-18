export const SET_USERNAME = "SET_USERNAME";

export interface Profile {
  id: string;
  username: string;
}

export interface ProfileState {
  id: string | null;
  username: string | null;
}

interface SetUsernameAction {
  type: typeof SET_USERNAME;
  username: string;
  id: string;
}

export type ProfileListType = {
  [key: string]: Profile;
};

export type ProfileActionTypes = SetUsernameAction;
