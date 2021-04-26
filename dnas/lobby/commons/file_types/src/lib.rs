use hdk::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadataInput {
    pub file_name: String,
    pub file_size: usize,
    pub file_type: String,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE", content = "payload")]
pub enum PayloadInput {
    #[serde(rename_all = "camelCase")]
    Text { payload: String },
    #[serde(rename_all = "camelCase")]
    File {
        metadata: FileMetadataInput,
        file_type: FileType,
        file_bytes: SerializedBytes,
    },
}

// impl From<PayloadInput> for Payload {
//     fn from(payload_input: PayloadInput) -> Payload {
//         match payload_input {
//             PayloadInput::Text { payload } => Payload::Text { payload },
//             PayloadInput::File {
//                 metadata,
//                 file_type,
//                 file_bytes,
//             } => {
//                 // create_entry(&) <--- GroupFileBytes

//                 let file = Payload::File {
//                     file_type,
//                     metadata: FileMetadata {
//                         file_type: metadata.file_type,
//                         file_name: metadata.file_name,
//                         file_size: metadata.file_size,
//                     },
//                 };

//                 file
//             }
//         }
//     }
// }

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub file_name: String,
    pub file_size: usize,
    pub file_type: String,
    pub file_hash: EntryHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE", content = "payload")]
pub enum FileType {
    Image { thumbnail: SerializedBytes },
    Video { thumbnail: SerializedBytes },
    Other,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE", content = "payload")]
pub enum Payload {
    #[serde(rename_all = "camelCase")]
    Text { payload: String },
    #[serde(rename_all = "camelCase")]
    File {
        metadata: FileMetadata,
        file_type: FileType,
    },
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE", content = "payload")]
pub enum PayloadType {
    Text,
    File,
    Media,
    All,
}
