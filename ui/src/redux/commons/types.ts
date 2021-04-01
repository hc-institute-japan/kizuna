// Common Types
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
