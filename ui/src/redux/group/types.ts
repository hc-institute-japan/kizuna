import { AgentPubKey } from "@holochain/conductor-api";
import { Profile } from "../profile/types";
import {
  Payload,
  TextPayload,
  FetchPayloadType,
  FilePayloadInput,
} from "../commons/types";

export const ADD_GROUP = "ADD_GROUP";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const REMOVE_MEMBERS = "REMOVE_MEMBERS";
export const ADD_MEMBERS = "ADD_MEMBERS";
export const SET_GROUP_MESSAGE = "SET_GROUP_MESSAGE";
export const SET_NEXT_BATCH_GROUP_MESSAGES = "SET_NEXT_BATCH_GROUP_MESSAGES";
export const SET_MESSAGES_BY_GROUP_BY_TIMESTAMP =
  "SET_MESSAGES_BY_GROUP_BY_TIMESTAMP";
export const SET_LATEST_GROUP_STATE = "SET_LATEST_GROUP_STATE";
export const SET_LATEST_GROUP_VERSION = "SET_LATEST_GROUP_VERSION";

// type declarations
type GroupMessageID = string; // Group Message EntryHash in base64 string
type GroupID = string; // Group's EntryHash in base64 string
type GroupRevisionID = string; // Group's HeaderHash in base64 string
type GroupEntryHash = Uint8Array; // Group's EntryHash
type GroupHeaderHash = Uint8Array; // Group's HeaderHash
type GroupMessageEntryHash = Uint8Array; // Group Message EntryHash
type PayloadInput = TextPayload | FilePayloadInput;
// end

// input declaration
export interface FileMetadataInput {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface CreateGroupInput {
  name: String;
  members: AgentPubKey[];
}

export interface UpdateGroupMembersIO {
  members: AgentPubKey[];
  groupId: GroupEntryHash;
  groupRevisionId: GroupHeaderHash;
}

export interface UpdateGroupNameIO {
  name: string;
  groupId: GroupEntryHash;
  groupRevisionId: GroupHeaderHash;
}

export interface GroupMessageInput {
  groupHash: GroupEntryHash;
  payloadInput: PayloadInput;
  sender: AgentPubKey;
  replyTo?: GroupMessageEntryHash;
}

export interface GroupMessageBatchFetchFilter {
  groupId: GroupEntryHash;
  // the entry hash of the last message in the last batch fetched
  lastFetched?: GroupMessageEntryHash;
  // 0 - seconds since epoch, 1 - nanoseconds. See Timestamp type in hdk doc for more info.
  lastMessageTimestamp?: [number, number];
  batchSize: number;
  payloadType: FetchPayloadType;
}

export interface GroupMessageByDateFetchFilter {
  groupId: GroupEntryHash;
  date: [number, number];
  payloadType: FetchPayloadType;
}
// end

export interface GroupMessage {
  groupMessageEntryHash: GroupMessageID;
  groupEntryHash: GroupID;
  author: string;
  payload: Payload; // subject to change
  timestamp: [number, number];
  replyTo?: GroupMessageID;
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
  [key: string]: GroupMessageID[];
}

export interface GroupMessagesContents {
  // key here is the base 64 string of GroupMessage EntryHash
  [key: string]: GroupMessage;
}

// Unused right now
export interface GroupMessageElement {
  // any field from Element received from HC can be added here
  // as needed
  entry: GroupMessage;
  // base64 string
  groupMessageHeaderHash: string;
  groupMessageEntryHash: string;
  // agentPubKey(?)
  signature: string;
}

// TODO: make sure this is fetched from holochain at some point
// export interface GroupVersion {
//   groupEntryHash: GroupID;
//   name: string;
//   conversants: string[];
//   timestamp: Date;
// }

export interface GroupConversation {
  originalGroupEntryHash: GroupID;
  originalGroupHeaderHash: GroupRevisionID;
  // versions: GroupVersion[];
  name: string;
  members: string[];
  createdAt: Date;
  creator: string;
  // TODO: enable setting of avatar for a GroupConversation
  avatar?: string;
  messages: GroupMessageID[];
}

export interface UpdateGroupMembersData {
  // base64 string
  members: string[];
  groupId: GroupID;
  groupRevisionId: GroupRevisionID;
}

export interface UpdateGroupNameData {
  name: string;
  groupId: GroupID;
  groupRevisionId: GroupRevisionID;
}

/*
 * Group Conversation interface
 */

export interface GroupConversationsState {
  conversations: {
    // key should be the originalGroupEntryHash
    [key: string]: GroupConversation;
  };
  messages: {
    [key: string]: GroupMessage;
  };
  // This saves memory for duplicate files because they have the same hash
  groupFiles: {
    [key: string]: Uint8Array;
  };
  // This makes it easier to manage when member of a group updates their username (username has no update fn yet)
  // and saves network calls to fetch username in case a member is part of multiple groups
  // key is agentPubKey
  members: {
    [key: string]: Profile;
  };
  // typing: {
  //   // key is GroupID
  //   // TODO: finish this
  //   [key: string]: Profile[]
  // }
}

// TODO: use it for typing action
export interface AddGroupAction {
  type: typeof ADD_GROUP;
  groupData: GroupConversation;
  membersUsernames: {
    [key: string]: Profile;
  };
}

export interface AddGroupMembersAction {
  type: typeof ADD_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersData;
  membersUsernames: {
    [key: string]: Profile;
  };
}

export interface RemoveGroupMembersAction {
  type: typeof REMOVE_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersData;
}

export interface UpdateGroupNameAction {
  type: typeof UPDATE_GROUP_NAME;
  updateGroupNameData: UpdateGroupNameData;
}

export interface SetGroupMessageAction {
  type: typeof SET_GROUP_MESSAGE;
  groupMessage: GroupMessage;
  fileBytes?: Uint8Array;
}

export interface SetNextBatchGroupMessagesAction {
  type: typeof SET_NEXT_BATCH_GROUP_MESSAGES;
  groupMessagesOutput: GroupMessagesOutput;
  // for ease of retrieving groupID
  groupId: string;
}

export interface SetMessagesByGroupByTimestampAction {
  type: typeof SET_MESSAGES_BY_GROUP_BY_TIMESTAMP;
  groupMessagesOutput: GroupMessagesOutput;
  groupId: string;
}

export interface SetLatestGroupState {
  type: typeof SET_LATEST_GROUP_STATE;
  groups: GroupConversation[];
  groupMessagesOutput: GroupMessagesOutput;
  members: Profile[];
}

export interface SetLatestGroupVersionAction {
  type: typeof SET_LATEST_GROUP_VERSION;
  groupData: GroupConversation;
  groupMessagesOutput: GroupMessagesOutput;
  membersUsernames: {
    [key: string]: Profile;
  };
}

export type GroupConversationsActionTypes =
  | AddGroupAction
  | AddGroupMembersAction
  | RemoveGroupMembersAction
  | UpdateGroupNameAction
  | SetGroupMessageAction
  | SetNextBatchGroupMessagesAction
  | SetMessagesByGroupByTimestampAction
  | SetLatestGroupState
  | SetLatestGroupVersionAction;
