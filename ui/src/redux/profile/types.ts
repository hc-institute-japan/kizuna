export const SET_USERNAME = "SET_USERNAME";
export const SET_PROFILE = "SET_PROFILE";

export interface AgentProfile {
  agent_pub_key: string;
  profile: {
    fields: {
      [key: string]: any;
    };
    nickname: string;
  };
}

// TODO: change username to nickname in the next clean up
export interface Profile {
  id: string;
  username: string;
  fields: {
    [key: string]: any;
  };
}

// TODO: change username to nickname in the next clean up
export interface ProfileState {
  id: string | null;
  username: string | null;
  fields: {
    [key: string]: any;
  };
}

interface SetUsernameAction {
  type: typeof SET_USERNAME;
  username: string;
  id: string;
}

interface SetProfileAction {
  type: typeof SET_PROFILE;
  nickname: string;
  id: string;
  fields: {};
}

export type ProfileListType = {
  [key: string]: Profile;
};

export type ProfileActionTypes = SetUsernameAction | SetProfileAction;
