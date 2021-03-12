import { AgentPubKey } from "@holochain/conductor-api";
import { Agent } from "http";

export const ADD_GROUP = "ADD_GROUP";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const REMOVE_MEMBERS = "REMOVE_MEMBERS";
export const ADD_MEMBERS = "ADD_MEMBERS";
export const SEND_GROUP_MESSAGE = "SEND_GROUP_MESSAGE";

// type declarations
type GroupMessageID = string;
type GroupID = string; // Group's EntryHash
type GroupFileBytesID = string; // GroupFileBytes' EntryHash
type GroupRevisionID = string; // Group's HeaderHash
export type Payload = TextPayload | FilePayload;
type PayloadInput = TextPayload | FilePayloadInput;
export type FileType =
  | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
  | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
  | { type: "OTHER"; payload: null };
// end

// input declaration
export interface CreateGroupInput {
  name: String;
  members: AgentPubKey[];
}

export interface UpdateGroupMembersIO {
  members: AgentPubKey[];
  groupId: GroupID;
  groupRevisionId: GroupRevisionID;
}

export interface UpdateGroupNameIO {
  name: string;
  groupId: GroupID;
  groupRevisionId: GroupRevisionID;
}

export interface GroupMessageInput {
  groupHash: GroupID;
  payloadInput: PayloadInput;
  sender: AgentPubKey;
  replyTo?: GroupMessageID;
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
    fileBytes: Uint8Array;
  };
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
  author: AgentPubKey;
  payload: Payload; // subject to change
  timestamp: Date;
  replyTo?: GroupMessageID;
  readList: {
    // key is AgentPubKey
    [key: string]: Date;
  };
}

// TODO: make sure this is fetched from holochain at some point
// export interface GroupVersion {
//   groupEntryHash: GroupID;
//   name: string;
//   conversants: AgentPubKey[];
//   timestamp: Date;
// }

export interface GroupConversation {
  originalGroupEntryHash: GroupID;
  originalGroupHeaderHash: GroupRevisionID;
  // versions: GroupVersion[];
  name: string;
  members: AgentPubKey[];
  createdAt: Date;
  creator: AgentPubKey;
  messages: GroupMessageID[];
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
  updateGroupMembersData: UpdateGroupMembersIO;
}

export interface RemoveGroupMembersAction {
  type: typeof REMOVE_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersIO;
}

export interface UpdateGroupNameAction {
  type: typeof UPDATE_GROUP_NAME;
  UpdateGroupNameIO: UpdateGroupNameIO;
}

export interface sendGroupMessage {
  type: typeof SEND_GROUP_MESSAGE;
  groupMessage: GroupMessage;
  fileBytes?: Uint8Array;
}

export type GroupConversationsActionTypes =
  | AddGroupAction
  | AddGroupMembersAction
  | RemoveGroupMembersAction
  | UpdateGroupNameAction
  | sendGroupMessage;

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
