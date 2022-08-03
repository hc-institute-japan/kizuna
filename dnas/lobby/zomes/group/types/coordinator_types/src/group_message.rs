use hdk::prelude::{timestamp::Timestamp, *};
use std::collections::HashMap;
use group_integrity_types::{Payload, GroupMessage};

// input type definitions

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageInput {
    group_hash: EntryHash,
    payload_input: PayloadInput,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMsgBatchFetchFilter {
    pub group_id: EntryHash,
    // the last message of the last batch
    pub last_fetched: Option<EntryHash>,
    pub last_message_timestamp: Option<Timestamp>,
    // usize?
    pub batch_size: u8,
    pub payload_type: PayloadType,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMsgAdjacentFetchFilter {
    group_id: EntryHash,
    // the message EntryHash that has previous and later adjacent messages
    adjacent_message: EntryHash,
    message_timestamp: Timestamp,
    // This batch size goes for both previou and later messages of adjacent message
    batch_size: u8,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupChatFilter {
    // has to be the original EntryHash of Group
    group_id: EntryHash,
    // has to be divideable to result in YYYY/MM/DD/00:00
    date: Timestamp,
    payload_type: PayloadType,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupTypingDetailData {
    pub group_id: EntryHash,
    pub indicated_by: AgentPubKey,
    pub members: Vec<AgentPubKey>,
    pub is_typing: bool,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageReadData {
    pub group_id: EntryHash,
    pub message_ids: Vec<EntryHash>,
    pub reader: AgentPubKey,
    pub timestamp: Timestamp,
    pub members: Vec<AgentPubKey>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageInputWithDate {
    group_hash: EntryHash,
    payload: PayloadInput,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
    date: u64,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PinDetail {
    group_hash: EntryHash,
    group_message_hash: EntryHash,
}

// file type definitions

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

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadataInput {
    pub file_name: String,
    pub file_size: usize,
    pub file_type: String,
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
pub enum PayloadType {
    Text,
    File,
    Media,
    All,
}

// output type definitions

/**
 * This struct is needed since the entry field of Record will not be deserialized
 * automatically when it reaches the frontend.
 */
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageRecord {
    pub entry: GroupMessageData,
    pub signed_action: SignedActionHashed,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageContent {
    pub group_message_record: GroupMessageRecord,
    pub read_list: HashMap<String, Timestamp>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageData {
    pub message_id: EntryHash,
    pub group_hash: EntryHash,
    pub payload: Payload,
    pub created: Timestamp,
    pub sender: AgentPubKey,
    pub reply_to: Option<GroupMessageWithId>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessagesOutput {
    messages_by_group: HashMap<String, Vec<EntryHash>>,
    group_messages_contents: HashMap<String, GroupMessageContent>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageWithId {
    // entry_hash of GroupMessage
    pub id: EntryHash,
    pub content: GroupMessage,
}
