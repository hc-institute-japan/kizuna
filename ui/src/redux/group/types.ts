import {
  FetchPayloadType,
  FilePayloadInput,
  Payload,
  TextPayload,
} from "../commons/types";
import { Profile } from "../profile/types";

export const ADD_GROUP = "ADD_GROUP";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const REMOVE_MEMBERS = "REMOVE_MEMBERS";
export const ADD_MEMBERS = "ADD_MEMBERS";
export const SET_GROUP_MESSAGE = "SET_GROUP_MESSAGE";
export const SET_GROUP_MESSAGES = "SET_GROUP_MESSAGES";
export const SET_ERR_GROUP_MESSAGE = "SET_ERR_GROUP_MESSAGE";
export const SET_LATEST_GROUP_STATE = "SET_LATEST_GROUP_STATE";
export const SET_LATEST_GROUP_VERSION = "SET_LATEST_GROUP_VERSION";
export const SET_FILES_BYTES = "SET_FILES_BYTES";
export const SET_GROUP_TYPING_INDICATOR = "SET_GROUP_TYPING_INDICATOR";
export const SET_GROUP_READ_MESSAGE = "SET_GROUP_READ_MESSAGE";
export const SET_PINNED_MESSAGES = "SET_PINNNED_MESSAGES";
export const SET_CONVERSATIONS = "SET_CONVERSATIONS";

/* TYPE DECLARATIONS */
type GroupMessageIDB64 = string; // Group Message EntryHash in base64 string
type GroupIDB64 = string; // Group's EntryHash in base64 string
type GroupRevisionIDB64 = string; // Group's HeaderHash in base64 string
type PayloadInput = TextPayload | FilePayloadInput;
/* END OF TYPE DECLARATIONS */

export interface RepliedMessage {
  groupId: GroupIDB64;
  author: string;
  payload: Payload; // subject to change
  timestamp: Date;
  replyTo?: GroupMessageIDB64;
  readList: {
    // key is AgentPubKey
    [key: string]: Date;
  };
}

export interface GroupMessageBundle {
  groupMessageId: string;
  groupId: string;
  author: Profile;
  payload: Payload; // subject to change
  timestamp: Date;
  replyTo?: RepliedMessage;
  replyToId?: string;
  readList: {
    // key is AgentPubKey
    [key: string]: Date;
  };
  err?: boolean;
}

/* INPUT DECLARATION */
export interface FileMetadataInput {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface CreateGroupInput {
  name: String;
  members: string[]; // deserialize to AgentPubKey
}

export interface GroupMessageInput {
  groupId: string; // deserialize to HoloHash
  payloadInput: PayloadInput;
  sender: string; // deserialize to AgentPubKey
  replyTo?: string; // deserialize to AgentPubKey
}

export interface GroupMessageBatchFetchFilter {
  groupId: string; // deserialize to HoloHash
  lastFetched?: string; // the entry hash of the last message in the last batch fetched. deserialize to HoloHash
  lastMessageTimestamp?: Date; // converted to [number, number] for zome fn
  batchSize: number;
  payloadType: FetchPayloadType;
}

export interface GroupMessagAdjacentFetchFilter {
  groupId: string;
  adjacentMessage: string; // Message id of the message being adjacent
  messageTimestamp: Date;
  // This batch size goes for both previou and later messages of adjacent message
  batchSize: number;
}

export interface GroupMessageByDateFetchFilter {
  groupId: string; // deserialize to HoloHash
  date: Date;
  payloadType: FetchPayloadType;
}

export interface GroupTypingDetailData {
  groupId: string; // deserialize to HoloHash
  indicatedBy: string; // deserialize to AgentPubKey
  members: string[]; // deserialize to AgentPubKey
  isTyping: boolean;
}

export interface GroupMessageReadData {
  groupId: string; // deserialize to Holohash
  messageIds: string[]; // deserialize to Holohash
  reader: string; // deserialize to AgentPubKey
  timestamp: Date;
  members: string[]; // deserialize to AgentPubKey
}
/* END OF INPUT DECLARATION */

export interface GroupTypingDetail {
  groupId: GroupIDB64;
  indicatedBy: Profile;
  isTyping: boolean;
}

export interface GroupMessageReadDetail {
  groupId: GroupIDB64;
  messageIds: GroupMessageIDB64[];
  reader: string;
  timestamp: Date;
}

export interface GroupMessage {
  groupMessageId: GroupMessageIDB64;
  groupId: GroupIDB64;
  author: string;
  payload: Payload; // subject to change
  timestamp: Date;
  replyTo?: RepliedMessage;
  readList: {
    // key is AgentPubKey
    [key: string]: Date;
  };
}

export interface GroupMessagesOutput {
  messagesByGroup: MessagesByGroup;
  groupMessagesContents: GroupMessagesContents;
}

export interface MessagesByGroup {
  // key here is the base64 string of Group EntryHash
  [key: string]: GroupMessageIDB64[];
}

export interface GroupMessagesContents {
  // key here is the base 64 string of GroupMessage EntryHash
  [key: string]: GroupMessage;
}

// Unused right now
// export interface GroupMessageElement {
//   // any field from Element received from HC can be added here
//   // as needed
//   entry: GroupMessage;
//   // base64 string
//   groupMessageHeaderHash: string;
//   groupMessageEntryHash: string;
//   // agentPubKey(?)
//   signature: string;
// }

// TODO: make sure this is fetched from holochain at some point
// export interface GroupVersion {
//   groupEntryHash: GroupID;
//   name: string;
//   conversants: string[];
//   timestamp: Date;
// }

export interface GroupConversation {
  originalGroupId: GroupIDB64;
  originalGroupRevisionId: GroupRevisionIDB64;
  // versions: GroupVersion[];
  name: string;
  members: string[];
  createdAt: Date;
  creator: string;
  // TODO: enable setting of avatar for a GroupConversation
  avatar?: string;
  messages: GroupMessageIDB64[];
  pinnedMessages: GroupMessageIDB64[];
}

export interface UpdateGroupMembersData {
  // base64 string
  members: string[];
  groupId: GroupIDB64;
  groupRevisionId: GroupRevisionIDB64;
}

export interface UpdateGroupNameData {
  name: string;
  groupId: GroupIDB64;
  groupRevisionId: GroupRevisionIDB64;
}

/* GROUP CONVERSATION INTERFACE */

export interface GroupConversationsState {
  conversations: {
    // key should be the originalGroupEntryHash
    [key: string]: GroupConversation;
  };
  messages: {
    [key: string]: GroupMessage;
  };
  groupFiles: {
    [key: string]: Uint8Array;
  };
  // This makes it easier to manage when member of a group updates their username (username has no update fn yet)
  // and saves network calls to fetch username in case a member is part of multiple groups
  // key is agentPubKey
  members: {
    [key: string]: Profile;
  };
  typing: {
    // key is GroupID
    // TODO: finish this
    [key: string]: Profile[];
  };
  pinnedMessages: {
    [key: string]: GroupMessage;
  };
  errMsgs: {
    [key: string]: GroupMessageBundle[];
  };
}

export interface AddGroupAction {
  type: typeof ADD_GROUP;
  conversations: {
    [key: string]: GroupConversation;
  };
  members: {
    [key: string]: Profile;
  };
}

export interface SetPinnedMessages {
  type: typeof SET_PINNED_MESSAGES;
  pinnedMessages: {
    [key: string]: GroupMessage;
  };
  conversations: {
    [key: string]: GroupConversation;
  };
}

export interface AddMembersAction {
  type: typeof ADD_MEMBERS;
  conversations: {
    [key: string]: GroupConversation;
  };
  members: {
    [key: string]: Profile;
  };
}

export interface RemoveMembersAction {
  type: typeof REMOVE_MEMBERS;
  conversations: {
    [key: string]: GroupConversation;
  };
  members: {
    [key: string]: Profile;
  };
}

export interface UpdateGroupNameAction {
  type: typeof UPDATE_GROUP_NAME;
  conversations: {
    [key: string]: GroupConversation;
  };
}

export interface SetGroupMessageAction {
  type: typeof SET_GROUP_MESSAGE;
  conversations: {
    [key: string]: GroupConversation;
  };
  messages: {
    [key: string]: GroupMessage;
  };
  groupFiles: {
    [key: string]: Uint8Array;
  };
}

export interface SetGroupMessagesAction {
  type: typeof SET_GROUP_MESSAGES;
  conversations: {
    [key: string]: GroupConversation;
  };
  messages: {
    [key: string]: GroupMessage;
  };
}

export interface SetGroupErrMessageAction {
  type: typeof SET_ERR_GROUP_MESSAGE;
  errMsgs: {
    [key: string]: GroupMessageBundle[];
  };
}

export interface SetLatestGroupState {
  type: typeof SET_LATEST_GROUP_STATE;
  messages: {
    [key: string]: GroupMessage;
  };
  conversations: {
    [key: string]: GroupConversation;
  };
  members: {
    [key: string]: Profile;
  };
}

export interface SetGroupTypingIndicator {
  type: typeof SET_GROUP_TYPING_INDICATOR;
  typing: { [key: string]: Profile[] };
}

export interface SetGroupReadMessage {
  type: typeof SET_GROUP_READ_MESSAGE;
  messages: { [key: string]: GroupMessage };
}

export interface SetFilesBytes {
  type: typeof SET_FILES_BYTES;
  filesBytes: {
    [key: string]: Uint8Array;
  };
}

export interface SetConversations {
  type: typeof SET_CONVERSATIONS;
  conversations: {
    [key: string]: GroupConversation;
  };
}

export type GroupConversationsActionTypes =
  | AddGroupAction
  | AddMembersAction
  | RemoveMembersAction
  | UpdateGroupNameAction
  | SetGroupMessageAction
  | SetGroupMessagesAction
  | SetGroupErrMessageAction
  | SetLatestGroupState
  | SetFilesBytes
  | SetGroupTypingIndicator
  | SetGroupReadMessage
  | SetPinnedMessages
  | SetConversations;
