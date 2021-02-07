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
  [ZOMES.CONTACTS]: {
    ADD_CONTACTS: "add_contacts",
    REMOVE_CONTACTS: "remove_contacts",
    BLOCK_CONTACTS: "block_contacts",
    UNBLOCK_CONTACTS: "unblock_contacts",
    LIST_ADDED: "list_added",
    LIST_BLOCKED: "list_blocked",
    IN_CONTACTS: "in_contacts",
    IN_BLOCKED: "in_blocked",
  },
};
