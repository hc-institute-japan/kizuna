/* 
  TODO: Discuss how to manage these types as it currently is being used in Redux and UI (dunno if that is problematic)
  These are types that are commonly used across redux (and currently in the react components as well).
  As much as possible, use the types here and do not make any type on your own
  if it is not absolutely necessary.
*/

/* 
  We are avoiding the usage of Buffer (as these are typed in the @holochain/conductor-api) in the ui
  as it is cumbersome to translate data types among Buffer, Uint8Array, and string. 
  TODO: This may be a temporary solution that may have better fix in the future
*/

import { Profile } from "../profile/types";

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
  fileHash: FileBytesID;
  thumbnail?: Uint8Array;
}

export type FileType =
  | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
  | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
  | { type: "OTHER"; payload?: null };

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
  payload:
    | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
    | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
    | { type: "OTHER"; payload?: null }
): payload is { type: "OTHER"; payload?: null } {
  return (payload as { type: "OTHER"; payload?: null }).type === "OTHER";
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

export function isVideo(
  payload:
    | { type: "IMAGE"; payload: { thumbnail: Uint8Array } }
    | { type: "VIDEO"; payload: { thumbnail: Uint8Array } }
): payload is { type: "VIDEO"; payload: { thumbnail: Uint8Array } } {
  return (
    (payload as { type: "VIDEO"; payload: { thumbnail: Uint8Array } }).type ===
    "VIDEO"
  );
}

/* 
  Temporarily placing these types here which is being used in the UI
*/

export interface Message {
  id: string;
  sender: Profile;
  message: string;
  fileName?: string;
  /* TODO: tats needs to fix the timestamp type in GroupMessage so that this can be typed as Date  */
  timestamp: [number, number];
}

/* used in Conversations page */
export interface Conversation {
  id: string;
  name: string;
  src: string;
  sender?: string;
  messages: Message[];
}

export type Conversations = Conversation[];
