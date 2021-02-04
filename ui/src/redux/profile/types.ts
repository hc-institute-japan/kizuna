export const SET_USERNAME = "SET_USERNAME";

export type ProfileID = string;

export interface Profile {
  id: ProfileID;
  username: string;
}

export interface ProfileState {
  username: string | null;
}

interface SetUsernameAction {
  type: typeof SET_USERNAME;
  username: string;
}

export type ProfileActionTypes = SetUsernameAction;
