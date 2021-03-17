export const SET_USERNAME = "SET_USERNAME";

export interface Profile {
  id: string;
  username: string;
}

export interface ProfileState {
  username: string | null;
}

interface SetUsernameAction {
  type: typeof SET_USERNAME;
  username: string;
}

export type ProfileListType = {
  [key: string]: Profile;
};

export type ProfileActionTypes = SetUsernameAction;
