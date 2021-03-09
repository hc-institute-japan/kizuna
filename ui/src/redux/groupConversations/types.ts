import { AgentPubKey } from "@holochain/conductor-api";

type ProfileID = string;
type GroupMessageID = string;
type GroupID = string; // Group's EntryHash
type GroupFileBytesID = string; // GroupFileBytes' EntryHash
type GroupRevisionID = string; // Group's HeaderHash
export type Payload = TextPayload | FilePayload;

export interface TextPayload {
  payload: String;
}

export interface FilePayload {
  fileName: String;
  fileSize: number;
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
    [key: string]: Date;
    // [key: ProfileID]: Date;
  };
}

// TODO: make sure this is fetched from holochain at some point
export interface GroupVersion {
  groupEntryHash: GroupID;
  name: string;
  conversants: ProfileID[];
  timestamp: Date;
}

export interface GroupConversation {
  originalGroupEntryHash: GroupID;
  originalGroupHeaderHash: GroupRevisionID;
  versions: GroupVersion[];
  createdAt: Date;
  creator: ProfileID;
  messages: GroupMessageID[];
}

/*
 * Group Conversation interface
 */

// group conversations redux
// reducer

export type ConversationsType = { [key: string]: GroupConversation };
export type MessagesType = {
  [key: string]: GroupMessage;
  // [key: GroupMessageID]: GroupMessage;
};
export type FileBytesType = {
  [key: string]: Uint8Array;
  // [key: GroupFileBytesID]: Uint8Array;
};

export interface GroupConversationsState {
  conversations: ConversationsType;
  messages: MessagesType;
  // This saves memory for duplicate files because they have the same hash
  fileBytes: FileBytesType;
}

// group conversations redux
// reducer

export const SET_CONVERSATIONS = "SET_CONVERSATIONSS";
export const SET_MESSAGES = "SET_MESSAGES";

export interface SetConversationsAction {
  type: typeof SET_CONVERSATIONS;
  conversations: ConversationsType;
}

export interface SetMessagesAction {
  type: typeof SET_MESSAGES;
  messages: MessagesType;
}

export type GroupConversationsActionTypes =
  | SetConversationsAction
  | SetMessagesAction;
