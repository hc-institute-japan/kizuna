interface ZomeNameType {
  [key: string]: string;
}

interface FunctionNameType {
  [key: string]: {
    [key: string]: string;
  };
}

interface SignalNameType {
  [key: string]: {
    [key: string]: string;
  };
}

export const ZOMES: ZomeNameType = {
  USERNAME: "username",
  PROFILES: "profiles",
  PREFERENCE: "preference",
  P2PMESSAGE: "p2pmessage",
  CONTACTS: "contacts",
  GROUP: "group",
  AGGREGATOR: "aggregator",
};
export const SIGNALS: SignalNameType = {
  [ZOMES.GROUP]: {
    ADDED_TO_GROUP: "ADDED_TO_GROUP",
    GROUP_MESSAGE_DATA: "GROUP_MESSAGE_DATA",
    GROUP_TYPING_DETAIL: "GROUP_TYPING_DETAIL",
    GROUP_MESSAGE_READ: "GROUP_MESSAGE_READ",
    PIN_MESSAGE_DATA: "PIN_MESSAGE_DATA",
  },
  [ZOMES.P2PMESSAGE]: {
    RECEIVE_P2P_MESSAGE: "RECEIVE_P2P_MESSAGE",
    RECEIVE_P2P_RECEIPT: "RECEIVE_P2P_RECEIPT",
    SYNC_P2P_PINS: "SYNC_P2P_PINS",
    TYPING_P2P: "TYPING_P2P",
    POST_COMMIT_ERROR_COMMIT_MESSAGE: "POST_COMMIT_ERROR_COMMIT_MESSAGE",
    POST_COMMIT_ERROR_COMMIT_RECEIPT: "POST_COMMIT_ERROR_COMMIT_RECEIPT",
  },
};

export const FUNCTIONS: FunctionNameType = {
  [ZOMES.USERNAME]: {
    SET_USERNAME: "set_username",
    GET_USERNAMES: "get_usernames",
    GET_ALL_USERNAMES: "get_all_usernames",
    GET_AGENT_PUBKEY_FROM_USERNAME: "get_agent_pubkey_from_username",
    GET_MY_USERNAME: "get_my_username",
  },
  [ZOMES.PROFILES]: {
    CREATE_PROFILE: "create_profile",
    SEARCH_PROFILES: "search_profiles",
    GET_AGENT_PROFILE: "get_agent_profile",
    GET_AGENTS_PROFILES: "get_agents_profile",
    GET_MY_PROFILE: "get_my_profile",
    GET_ALL_PROFILES: "get_all_profiles",
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
  [ZOMES.PREFERENCE]: {
    GET_PREFERENCE: "get_preference",
    SET_PREFERENCE: "set_preference",
    SET_PER_AGENT_PREFERENCE: "set_per_agent_preference",
    GET_PER_AGENT_PREFERENCE: "get_per_agent_preference",
    SET_PER_GROUP_PREFERENCE: "set_per_group_preference",
    GET_PER_GROUP_PREFERENCE: "get_per_group_preference",
  },
  [ZOMES.GROUP]: {
    CREATE_GROUP: "create_group",
    ADD_MEMBERS: "add_members",
    REMOVE_MEMBERS: "remove_members",
    UPDATE_GROUP_NAME: "update_group_name",
    UPDATE_GROUP_AVATAR: "update_group_avatar",
    SEND_MESSAGE: "send_message",
    GET_ALL_MY_GROUPS: "get_all_my_groups",
    GET_PREVIOUS_GROUP_MESSAGES: "get_previous_group_messages",
    GET_SUBSEQUENT_GROUP_MESSAGES: "get_subsequent_group_messages",
    GET_ADJACENT_GROUP_MESSAGES: "get_adjacent_group_messages",
    GET_MESSAGES_BY_GROUP_BY_TIMESTAMP: "get_messages_by_group_by_timestamp",
    GET_GROUP_LATEST_VERSION: "get_group_latest_version",
    INDICATE_GROUP_TYPING: "indicate_group_typing",
    READ_GROUP_MESSAGE: "read_group_message",
    GET_FILES_BYTES: "get_files_bytes",
    PIN_MESSAGE: "pin_message",
    UNPIN_MESSAGE: "unpin_message",
    FETCH_PINNED_MESSAGES: "get_pinned_messages",
  },
  [ZOMES.AGGREGATOR]: {
    RETRIEVE_LATEST_DATA: "retrieve_latest_data",
  },
  [ZOMES.P2PMESSAGE]: {
    SEND_MESSAGE: "send_message",
    SEND_MESSAGE_WITH_TIMESTAMP: "send_message_with_timestamp",
    COMMIT_MESSAGE_TO_RECEIVER: "commit_message_to_receiver_chain",
    GET_LATEST_MESSAGES: "get_latest_messages",
    GET_MESSAGES_BY_AGENT_BY_TIMESTAMP: "get_messages_by_agent_by_timestamp",
    GET_PREVIOUS_MESSAGES: "get_previous_messages",
    GET_ALL_MESSAGES: "get_all_messages",
    READ_MESSAGE: "read_message",
    GET_FILE_BYTES: "get_file_bytes",
    TYPING: "typing",
    PIN_MESSAGE: "pin_message",
    GET_PINNED_MESSAGES: "get_pinned_messages",
    GET_NEXT_MESSAGES: "get_next_messages",
    GET_ADJACENT_MESSAGES: "get_adjacent_messages",
  },
};
