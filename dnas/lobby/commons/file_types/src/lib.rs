use hdk3::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(rename_all="camelCase")]
pub struct FileMetadataInput {
    file_name: String,
    file_size: usize,
    file_type: String,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(rename_all="camelCase")]
 pub enum PayloadInput {
    Text {payload: String},
    File {
      metadata: FileMetadataInput,
      file_type: FileType
    }
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
 #[serde(rename_all="camelCase")]
pub struct FileMetadata {
   file_name: String,
   file_size: usize,
   file_type: String,
   file_hash: EntryHash
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(tag = "fileType")]
pub enum FileType {
    Image {
      thumbnail: SerializedBytes,
    },
    Video {
      thumbnail: SerializedBytes,
    },
    Other
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(tag = "type")]
enum Payload {
    Text {payload: String},
    File {
      metadata: FileMetadata,
      file_type: FileType
    }
}

