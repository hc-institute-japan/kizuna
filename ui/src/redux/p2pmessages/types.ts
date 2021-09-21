import { AgentPubKey } from "@holochain/conductor-api";
import { HoloHash } from "../commons/types";
import {
  MessageID,
  FileBytesID,
  Payload,
  TextPayload,
  FilePayloadInput,
} from "../commons/types";
import { Profile } from "../profile/types";

export interface Read {
  timestamp: [number, number];
}
export interface Delivered {
  timestamp: [number, number];
}

export interface P2PMessage {
  p2pMessageEntryHash: MessageID;
  author: Profile;
  receiver: Profile;
  payload: Payload;
  timestamp: Date;
  replyTo?: P2PMessage;
  replyToId?: string;
  receipts: P2PMessageReceiptID[];
  err?: boolean;
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

export interface P2PMessagePin {
  id: MessageID[];
  conversant: Profile;
  status: P2PPinStatus;
}

/* WRAPPERS */
export type P2PMessageReceiptID = string;
export type AgentPubKeyBase64 = string;
export type HoloHashBase64 = string;

/* ENUMS */
export type P2PMessageStatus = "sent" | "delivered" | "read";
export type P2PPinStatus = "pinned" | "unpinned";

/* STRUCTURES */
export interface Read {
  timestamp: [number, number];
}
export interface Delivered {
  timestamp: [number, number];
}
export interface Pinned {
  timestamp: [number, number];
}
export interface Unpinned {
  timestamp: [number, number];
}

/* INPUT STRUCTURES */
export interface MessageInput {
  receiver: AgentPubKey;
  payload: TextPayload | FilePayloadInput;
  reply_to: HoloHash | undefined;
}

export interface PinInput {
  id: MessageID[];
  conversant: AgentPubKeyBase64;
  status: String;
  timestamp: [number, number];
}

export interface P2PChatFilterBatch {
  conversant: AgentPubKeyBase64;
  batch_size: number;
  payload_type: String;
  last_fetched_timestamp?: [number, number];
  last_fetched_message_id?: HoloHash;
}

export type BatchSize = number;

/* OUTPUT STRUCTURES */
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

export interface P2PConversation {
  messages: MessageID[];
  pinned: MessageID[];
}

export interface PinContents {
  id: string;
  pin: P2PMessagePin;
}

// REDUX STRUCTURES
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
  pinned: {
    [key: string]: P2PMessage;
  };
  errMsgs: {
    // key is conversant ID
    [key: string]: P2PMessage[];
  };
}

/* ACTION TYPES */
export const SET_MESSAGES = "SET_MESSAGES";
export const SET_ERR_MESSAGE = "SET_ERR_MESSAGE";
export const SET_FILES = "SET_FILES";
export const SET_TYPING = "SET_TYPING";
export const APPEND_MESSAGE = "APPEND_MESSAGE";
export const APPEND_RECEIPT = "APPEND_RECEIPT";
export const APPEND_PIN = "APPEND_PIN";
export const PIN_MESSAGE = "PIN_MESSAGE";
export const UNPIN_MESSAGE = "UNPIN_MESSAGE";
export const SET_PINNED = "SET_PINNED";

/* ACTION INTERFACES */
export interface SetP2PMessagesAction {
  type: typeof SET_MESSAGES;
  state: P2PMessageConversationState;
}

export interface SetErrMessageAction {
  type: typeof SET_ERR_MESSAGE;
  state: {
    errMsgs: { [key: string]: P2PMessage[] };
  };
}

// not used
export interface SetP2PFilesAction {
  type: typeof SET_FILES;
  state: { [key: string]: Uint8Array };
}

// not used
export interface SetP2PTypingAction {
  type: typeof SET_TYPING;
  state: {
    profile: Profile;
    isTyping: boolean;
  };
}

// not used
export interface AppendP2PMessageAction {
  type: typeof APPEND_MESSAGE;
  state: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
    file?: P2PFile;
    key?: string;
  };
}

// not used
export interface AppendP2PMessageReceiptAction {
  type: typeof APPEND_RECEIPT;
  state: P2PMessageReceipt;
}

export interface SetP2PPinnedMessagesAction {
  type: typeof SET_PINNED;
  state: {
    conversant: string;
    messages: { [key: string]: P2PMessage };
  };
}

export interface PinP2PMessageAction {
  type: typeof PIN_MESSAGE;
  state: {
    conversant: string;
    messages: { [key: string]: P2PMessage };
  };
}

export interface UninP2PMessageAction {
  type: typeof UNPIN_MESSAGE;
  state: {
    conversant: string;
    messages: { [key: string]: P2PMessage };
  };
}

export type P2PMessageActionType =
  | SetP2PMessagesAction
  | SetErrMessageAction
  | AppendP2PMessageAction
  | AppendP2PMessageReceiptAction
  | SetP2PFilesAction
  | SetP2PTypingAction
  | PinP2PMessageAction
  | UninP2PMessageAction
  | SetP2PPinnedMessagesAction;
