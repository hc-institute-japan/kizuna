import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import {
    ProfileID,
    MessageID,
    FileBytesID,
    Payload,
    TextPayload,
    FilePayload,
    FilePayloadInput
} from "../commons/types";
import { SET_GROUP_TYPING_INDICATOR } from "../group/types";
import { Profile } from "../profile/types";

export const SET_MESSAGES = "SET_MESSAGES";
export const APPEND_MESSAGE = "APPEND_MESSAGE";
export const APPEND_RECEIPT = "APPEND_RECEIPT";
export const SET_FILES = "SET_FILES";
export const SET_TYPING = "SET_TYPING";

// export type ProfileID = string;
// export type MessageID = string;
// export type P2PFileBytes = string;
// export type Payload = Text | File;
// export interface Text {
//     type: string,
//     payload: string
// }
// export interface File {
//     fileName: string,
//     fileSize: number,
//     fileType: string,
//     fileHash?: string,
//     bytes?: Uint8Array
// }

export type P2PMessageReceiptID = string;
export type P2PMessageStatus = "sent" | "delivered" | "read";

export interface Read {
    timestamp: [number, number]
}
export interface Delivered {
    timestamp: [number, number]
}

export interface P2PConversation {
    messages: MessageID[]
}

export interface P2PMessage {
    p2pMessageEntryHash: MessageID,
    author: ProfileID,
    receiver: ProfileID,
    payload: Payload,
    timestamp: Date,
    replyTo?: MessageID,
    receipts: P2PMessageReceiptID[]
}

export interface P2PMessageReceipt {
    p2pMessageReceiptEntryHash: P2PMessageReceiptID,
    p2pMessageEntryHashes: MessageID[],
    timestamp: Date,
    status: P2PMessageStatus
}

export interface P2PFile {
    fileHash: FileBytesID,
    fileBytes: Uint8Array
}

export interface P2PMessageConversationState {
    conversations: {
        [key: string]: P2PConversation
    };
    messages: {
        [key: string]: P2PMessage
    };
    receipts: {
        [key: string]: P2PMessageReceipt
    };
    files: {
        [key: string]: Uint8Array
    },
    typing: {
        [key: string]: Profile
    }
}

export interface MessageInput {
    receiver: AgentPubKey,
    payload: TextPayload | FilePayloadInput,
    reply_to: HoloHash | undefined,
}

export type BatchSize = number;

export interface P2PChatFilterBatch {
    conversant: AgentPubKey,
    batch_size: number,
    payload_type: String,
    last_fetched_timestamp?: [number, number],
    last_fetched_message_id?: HoloHash
}

interface SetP2PMessagesAction {
    type: typeof SET_MESSAGES;
    state: P2PMessageConversationState;
} 

interface AppendP2PMessageAction {
    type: typeof APPEND_MESSAGE;
    state: {
        message: P2PMessage,
        receipt: P2PMessageReceipt,
        file? : P2PFile,
        key?: string
    }
}

interface AppendP2PMessageReceipt {
    type: typeof APPEND_RECEIPT
    state: P2PMessageReceipt
}

interface SetP2PFiles {
    type: typeof SET_FILES;
    state: { [key: string]: Uint8Array }
}

interface SetP2PTyping {
    type: typeof SET_TYPING
    state: {
        profile: Profile,
        isTyping: boolean
    }
}

export type P2PMessageActionType = SetP2PMessagesAction | AppendP2PMessageAction | AppendP2PMessageReceipt | SetP2PFiles | SetP2PTyping;