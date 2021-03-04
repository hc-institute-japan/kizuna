import { AgentPubKey } from "@holochain/conductor-api";
import { Agent } from "http";

export const ADD_GROUP = "ADD_GROUP";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const REMOVE_MEMBERS = "REMOVE_MEMBERS";
export const ADD_MEMBERS = "ADD_MEMBERS";

type GroupMessageID = string;
type GroupID = string; // Group's EntryHash
type GroupFileBytesID = string; // GroupFileBytes' EntryHash
type GroupRevisionID = string; // Group's HeaderHash
type Payload = TextPayload | FilePayload;

export interface createGroupInput {
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

export interface TextPayload {
  payload: String;
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
  fileBytes: {
    [key: string]: Uint8Array;
  };
}

// TODO: use it for typing action
interface addGroupAction {
  type: typeof ADD_GROUP;
  groupData: GroupConversation;
}

interface addGroupMembersAction {
  type: typeof ADD_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersIO;
}

interface removeGroupMembersAction {
  type: typeof REMOVE_MEMBERS;
  updateGroupMembersData: UpdateGroupMembersIO;
}

interface updateGroupNameAction {
  type: typeof UPDATE_GROUP_NAME;
  UpdateGroupNameIO: UpdateGroupNameIO;
}
