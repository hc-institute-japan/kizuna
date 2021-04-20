import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import Profile from "../../app/Profile";
import {
    ProfileID,
    MessageID,
    FileBytesID,
    Payload,
    TextPayload,
    FilePayload,
    FilePayloadInput
} from "../commons/types";

export const SET_MESSAGES = "SET_MESSAGES";
export const APPEND_MESSAGE = "APPEND_MESSAGE";

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

export interface P2PConversation {
    messages: MessageID[]
}

export interface P2PMessage {
    p2pMessageEntryHash: MessageID,
    author: ProfileID,
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

export interface P2PMessageConversationState {
    conversations: {
        [key: string]: P2PConversation
    };
    messages: {
        [key: string]: P2PMessage
    };
    receipts: {
        [key: string]: P2PMessageReceipt
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
    state: P2PMessage
}

export type P2PMessageActionType = SetP2PMessagesAction | AppendP2PMessageAction;