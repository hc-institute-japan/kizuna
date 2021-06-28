export const SET_PREFERENCE = "SET_PREFERENCE";

export interface PreferenceState {
  readReceipt: boolean;
  typingIndicator: boolean;
  agentReadReceipt: {
    [key: string]: true;
  };
  agentTypingIndicator: {
    [key: string]: true;
  };
  groupTypingIndicator: {
    [key: string]: true;
  };
  groupReadReceipt: {
    [key: string]: true;
  };
}

export interface PreferenceParameter {
  [key: string]: any;
  readReceipt?: boolean;
  typingIndicator?: boolean;
}

export interface SetPreferenceAction {
  type: typeof SET_PREFERENCE;
  preference: PreferenceParameter;
}

export type PreferenceAction = SetPreferenceAction;
