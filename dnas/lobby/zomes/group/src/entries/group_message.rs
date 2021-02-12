use file_types::{Payload, PayloadInput, PayloadType};
use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;
use std::collections::hash_map::HashMap;

pub mod handlers;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash)]
pub struct GroupMessageHash(pub EntryHash);

impl PartialEq for GroupMessageHash {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}
impl Eq for GroupMessageHash {}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash)]
pub struct GroupEntryHash(pub EntryHash);

impl PartialEq for GroupEntryHash {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}
impl Eq for GroupEntryHash {}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _ReadList(pub HashMap<AgentPubKey, Timestamp>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessageElement(pub Element);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageContent(pub _GroupMessageElement, pub _ReadList);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct MessagesByGroup(pub HashMap<GroupEntryHash, Vec<GroupMessageHash>>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessagesContents(pub HashMap<GroupMessageHash, GroupMessageContent>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessagesOutput(MessagesByGroup, _GroupMessagesContents);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMsgBatchFetchFilter {
    group_id: EntryHash,
    // the last message of the last batch
    last_fetched: Option<EntryHash>,
    last_message_timestamp: Option<Timestamp>,
    // usize?
    batch_size: u8,
    payload_type: PayloadType,
}

// GROUP MESSAGE TYPE DEFINITION, GETTERS, SETTERS, ENTRY_DEF, UTILS ...
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessage {
    // EntryHash of first ver of Group
    group_hash: EntryHash,
    payload: Payload,
    created: Timestamp,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}

entry_def!(GroupMessage
    EntryDef {
        id: "group_message".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);
#[hdk_entry(id = "group_file_bytes", visibility = "public")]
pub struct GroupFileBytes(SerializedBytes);
// END OF GROUP MESSAGE TYPE DEFINITION

// START OF INPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageInput {
    group_hash: EntryHash,
    payload: PayloadInput,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupChatFilter {
    // has to be the original EntryHash of Group
    group_id: EntryHash,
    // has to be divideable to result in YYYY/MM/DD/00:00
    date: Timestamp,
    payload_type: PayloadType,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupTypingDetailData {
    pub group_id: EntryHash,
    pub indicated_by: AgentPubKey,
    pub members: Vec<AgentPubKey>,
    pub is_typing: bool,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageReadData {
    pub group_id: EntryHash,
    pub message_ids: Vec<EntryHash>,
    pub reader: AgentPubKey,
    pub timestamp: Timestamp,
    pub members: Vec<AgentPubKey>,
}
// END OF INPUTS TYPES DEFINITION

// OUTPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageData {
    // entry_hash of GroupMessage
    pub id: EntryHash,
    pub content: GroupMessage,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageDataWrapper(Vec<GroupMessageData>);
// END OF OUTPUTS TYPES DEFINITION
