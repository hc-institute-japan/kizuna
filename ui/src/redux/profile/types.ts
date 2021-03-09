import { AgentPubKey } from "@holochain/conductor-api";

export const SET_USERNAME = "SET_USERNAME";
export const SET_ID = "SET_ID";

export const SET_PROFILE = "SET_PROFILE";

export interface Profile {
  id: AgentPubKey;
  username: string;
}

export interface ProfileState {
  id: AgentPubKey | null;
  username: string | null;
}

interface SetUsernameAction {
  type: typeof SET_USERNAME;
  username: string;
}

interface SetProfileAction {
  type: typeof SET_PROFILE;
  username: string;
  id: AgentPubKey;
}

interface SetIdAction {
  type: typeof SET_ID;
  id: AgentPubKey;
}

export type ProfileListType = {
  [key: string]: Profile;
};

export type ProfileActionTypes =
  | SetUsernameAction
  | SetProfileAction
  | SetIdAction;
