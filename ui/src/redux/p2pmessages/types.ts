import { AgentPubKey } from "@holochain/conductor-api";
import { HoloHash } from "../commons/types";
import {
  ProfileID,
  MessageID,
  FileBytesID,
  Payload,
  TextPayload,
  FilePayloadInput,
} from "../commons/types";
import { Profile } from "../profile/types";

export type P2PMessageReceiptID = string;
export type P2PMessageStatus = "sent" | "delivered" | "read";
export type AgentPubKeyBase64 = string;
export type HoloHashBase64 = string;

export interface Read {
  timestamp: [number, number];
}
export interface Delivered {
  timestamp: [number, number];
}

export interface P2PConversation {
  messages: MessageID[];
}

export interface P2PMessage {
  p2pMessageEntryHash: MessageID;
  author: Profile;
  receiver: ProfileID;
  payload: Payload;
  timestamp: Date;
  replyTo?: P2PMessage;
  receipts: P2PMessageReceiptID[];
}

export interface P2PMessageReceipt {
  p2pMessageReceiptEntryHash: P2PMessageReceiptID;
  p2pMessageEntryHashes: MessageID[];
  timestamp: Date;
  status: P2PMessageStatus;
}

export interface P2PFile {
  fileHash: FileBytesID;
  fileBytes: Uint8Array;
}

export interface P2PHashMap {
  conversations: {
    [key: string]: P2PConversation;
  };
  messages: {
    [key: string]: P2PMessage;
  };
  receipts: {
    [key: string]: P2PMessageReceipt;
  };
}

export interface P2PMessageConversationState {
  conversations: {
    [key: string]: P2PConversation;
  };
  messages: {
    [key: string]: P2PMessage;
  };
  receipts: {
    [key: string]: P2PMessageReceipt;
  };
  files: {
    [key: string]: Uint8Array;
  };
  typing: {
    [key: string]: Profile;
  };
}

export interface MessageInput {
  receiver: AgentPubKey;
  payload: TextPayload | FilePayloadInput;
  reply_to: HoloHash | undefined;
}

export interface P2PChatFilterBatch {
  conversant: AgentPubKeyBase64;
  batch_size: number;
  payload_type: String;
  last_fetched_timestamp?: [number, number];
  last_fetched_message_id?: HoloHash;
}

export type BatchSize = number;

/* ACTION TYPES */
export const SET_MESSAGES = "SET_MESSAGES";
export const SET_FILES = "SET_FILES";
export const SET_TYPING = "SET_TYPING";
export const APPEND_MESSAGE = "APPEND_MESSAGE";
export const APPEND_RECEIPT = "APPEND_RECEIPT";

interface SetP2PMessagesAction {
  type: typeof SET_MESSAGES;
  state: P2PMessageConversationState;
}

interface SetP2PFiles {
  type: typeof SET_FILES;
  state: { [key: string]: Uint8Array };
}

interface SetP2PTyping {
  type: typeof SET_TYPING;
  state: {
    profile: Profile;
    isTyping: boolean;
  };
}

interface AppendP2PMessageAction {
  type: typeof APPEND_MESSAGE;
  state: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
    file?: P2PFile;
    key?: string;
  };
}

interface AppendP2PMessageReceipt {
  type: typeof APPEND_RECEIPT;
  state: P2PMessageReceipt;
}

export type P2PMessageActionType =
  | SetP2PMessagesAction
  | AppendP2PMessageAction
  | AppendP2PMessageReceipt
  | SetP2PFiles
  | SetP2PTyping;
