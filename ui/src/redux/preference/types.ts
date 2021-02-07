export const SET_PREFERENCE = "SET_PREFERENCE";

// interface Preference {
//   readReceipt: boolean;
//   typingIndicator: boolean;
// }

// interface PerAgentPreference {
//   readReceipt: {
//     [key: string]: true;
//   };

//   typingIndicator: {
//     [key: string]: true;
//   };
// }

// interface PerGroupPreference {
//   readReceipt: {
//     [key: string]: true;
//   };

//   typingIndicator: {
//     [key: string]: true;
//   };
// }

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
