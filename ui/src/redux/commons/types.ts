/* 
  TODO: Discuss how to manage these types as it currently is being used in Redux and UI (dunno if that is problematic)
  These are types that are commonly used across redux (and currently in the react components as well).
  As much as possible, use the types here and do not make any type on your own
  if it is not absolutely necessary.
*/

import { GroupMessage } from "../group/types";
import { P2PMessage } from "../p2pmessages/types";
import { Profile } from "../profile/types";

/* 
  We are avoiding the usage of Buffer (as these are typed in the @holochain/conductor-api) in the ui
  as it is cumbersome to translate data types among Buffer, Uint8Array, and string. 
  TODO: This may be a temporary solution that may have better fix in the future
*/
export type HoloHash = Uint8Array;

export type ProfileID = string;
export type MessageID = string;
export type FileBytesID = string;

export type Payload = TextPayload | FilePayload;

export interface TextPayload {
  type: "TEXT";
  payload: { payload: string };
}
export interface FilePayload {
  type: "FILE";
  fileName: string;
  fileSize: number;
  fileType: "IMAGE" | "VIDEO" | "OTHER";
  fileHash?: FileBytesID;
  fileBytes?: Uint8Array;
  thumbnail?: Uint8Array;
}

export interface ReplyTo {
  author: Profile;
  id: string;
  payload: Payload;
}

export type FileType = {
  type: "VIDEO" | "IMAGE" | "OTHER";
  payload?: { thumbnail: Uint8Array } | null;
};

export type FetchPayloadType =
  | { type: "TEXT"; payload: null }
  | { type: "FILE"; payload: null }
  | { type: "MEDIA"; payload: null }
  | { type: "ALL"; payload: null };

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

// type guards
export function isTextPayload(
  payload: TextPayload | FilePayloadInput | FilePayload
): payload is TextPayload {
  return (payload as TextPayload).type === "TEXT";
}

export function isOther(
  payload: FileType
): payload is { type: "OTHER"; payload?: null } {
  return (payload as { type: "OTHER"; payload?: null }).type === "OTHER";
}

export function isImage(
  payload: FileType
): payload is { type: "IMAGE"; payload: { thumbnail: Uint8Array } } {
  return (
    (payload as { type: "IMAGE"; payload: { thumbnail: Uint8Array } }).type ===
    "IMAGE"
  );
}

export function isVideo(
  payload: FileType
): payload is { type: "VIDEO"; payload: { thumbnail: Uint8Array } } {
  return (
    (payload as { type: "VIDEO"; payload: { thumbnail: Uint8Array } }).type ===
    "VIDEO"
  );
}

export function isP2PMessage(
  message: P2PMessage | GroupMessage
): message is P2PMessage {
  return (message as P2PMessage).p2pMessageEntryHash !== undefined;
}

/* 
  Temporarily placing these types here which is being used in the UI
*/

export interface Message {
  id: string;
  sender?: Profile;
  payloadType: "TEXT" | "FILE";
  /* undefined when payload type is FILE */
  textPayload?: string;
  fileName?: string;
  /* TODO: tats needs to fix the timestamp type in GroupMessage so that this can be typed as Date  */
  timestamp: Date;
}

/* used in Conversations page */
export interface Conversation {
  type: "p2p" | "group";
  avatar?: string;
  id: string;
  conversationName: string;
  // src: string;
  sender?: string;
  latestMessage: Message;
  badgeCount?: number;
}

export type Conversations = Conversation[];
