import { AgentPubKey } from "@holochain/conductor-api";

export const ADD_GROUP = "ADD_GROUP";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const REMOVE_MEMBERS = "REMOVE_MEMBERS";
export const ADD_MEMBERS = "ADD_MEMBERS";
export const SEND_GROUP_MESSAGE = "SEND_GROUP_MESSAGE";
export const GET_NEXT_BATCH_GROUP_MESSAGES = "GET_NEXT_BATCH_GROUP_MESSAGES";

// type declarations
type GroupMessageID = string; // Group Message EntryHash in base64 string
type GroupID = string; // Group's EntryHash in base64 string
type GroupRevisionID = string; // Group's HeaderHash in base64 string
type GroupFileBytesID = string; // GroupFileBytes' EntryHash in base64 string
type GroupEntryHash = Uint8Array; // Group's EntryHash
type GroupHeaderHash = Uint8Array; // Group's HeaderHash
type GroupMessageEntryHash = Uint8Array; // Group Message EntryHash
type GroupFileBytesEntryHash = Uint8Array; // GroupFileBytes' EntryHash
export type Payload = TextPayload | FilePayload;
type PayloadInput = TextPayload | FilePayloadInput;
export type FileType =
  | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
  | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
  | { type: "OTHER"; payload: null };
export type FetchPayloadType =
  | { type: "TEXT"; payload: null }
  | { type: "FILE"; payload: null }
  | { type: "ALL"; payload: null };
// end

// input declaration
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

export interface FileMetadataInput {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface FilePayloadInput {
  type: "FILE";
  payload: {
    metadata: FileMetadataInput;
    fileType: FileType;
    fileBytes: GroupFileBytesEntryHash;
  };
}

export interface GroupMessageBatchFetchFilter {
  groupId: GroupEntryHash;
  // the entry hash of the last message in the last batch fetched
  lastFetched?: GroupMessageEntryHash;
  lastMessageTimestamp?: Date;
  batchSize: number;
  payloadType: FetchPayloadType;
}

// end

export interface TextPayload {
  type: "TEXT";
  payload: { payload: String };
}

export interface FilePayload {
  fileName: String;
  fileSize: Uint8Array;
  fileType: String;
  fileHash: GroupFileBytesID;
  thumbnail?: Uint8Array;
}

export interface GroupMessage {
  groupMessageEntryHash: GroupMessageID;
  groupEntryHash: GroupID;
  author: string;
  payload: Payload; // subject to change
  timestamp: Date;
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
}

// TODO: use it for typing action
export interface AddGroupAction {
  type: typeof ADD_GROUP;
  groupData: GroupConversation;
}

export interface AddGroupMembersAction {
  type: typeof ADD_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersData;
}

export interface RemoveGroupMembersAction {
  type: typeof REMOVE_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersData;
}

export interface UpdateGroupNameAction {
  type: typeof UPDATE_GROUP_NAME;
  updateGroupNameData: UpdateGroupNameData;
}

export interface SendGroupMessageAction {
  type: typeof SEND_GROUP_MESSAGE;
  groupMessage: GroupMessage;
  fileBytes?: Uint8Array;
}

export interface GetNextBatchGroupMessagesAction {
  type: typeof GET_NEXT_BATCH_GROUP_MESSAGES;
  groupMessagesOutput: GroupMessagesOutput;
  // for ease of retrieving groupID
  groupId: string;
}

export type GroupConversationsActionTypes =
  | AddGroupAction
  | AddGroupMembersAction
  | RemoveGroupMembersAction
  | UpdateGroupNameAction
  | SendGroupMessageAction
  | GetNextBatchGroupMessagesAction;

// type guards
export function isTextPayload(
  payload: TextPayload | FilePayloadInput | FilePayload
): payload is TextPayload {
  return (payload as TextPayload).type === "TEXT";
}

export function isOther(
  payload:
    | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
    | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
    | { type: "OTHER"; payload: null }
): payload is { type: "OTHER"; payload: null } {
  return (payload as { type: "OTHER"; payload: null }).type === "OTHER";
}

export function isImage(
  payload:
    | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
    | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
): payload is { type: "IMAGE"; payload: { thumbnail: Uint8Array } } {
  return (
    (payload as { type: "IMAGE"; payload: { thumbnail: Uint8Array } }).type ===
    "IMAGE"
  );
}
