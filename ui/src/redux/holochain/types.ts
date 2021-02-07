interface ZomeNameType {
  [key: string]: string;
}

interface FunctionNameType {
  [key: string]: {
    [key: string]: string;
  };
}

export const ZOMES: ZomeNameType = {
  USERNAME: "username",
  PREFERENCE: "preference",
  P2PMESSAGE: "p2pmessage",
  CONTACTS: "contacts",
};

export const FUNCTIONS: FunctionNameType = {
  [ZOMES.USERNAME]: {
    SET_USERNAME: "set_username",
    GET_USERNAME: "get_username",
    GET_ALL_USERNAMES: "get_all_usernames",
    GET_AGENT_PUBKEY_FROM_USERNAME: "get_agent_pubkey_from_username",
    GET_MY_USERNAME: "get_my_username",
  },
};
