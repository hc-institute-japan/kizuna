use file_types::{Payload, PayloadInput, PayloadType};
use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;
use std::collections::hash_map::HashMap;

// i added this type while we move to the next holochain version
use std::time::SystemTime;

pub mod handlers;
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct BatchSize(u8);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash, PartialEq, Eq, Debug)]
pub struct GroupMessageHash(pub EntryHash);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash, PartialEq, Eq, Debug)]
pub struct GroupEntryHash(pub EntryHash);

//this type was modfied the field Timestamp was changed for SystemTime
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct ReadList(pub HashMap<String, SystemTime>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageElement(pub Element);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageContent(pub GroupMessageElement, pub ReadList);

//--------------------------------------------------------------

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessagesByGroup(pub HashMap<String, Vec<GroupMessageHash>>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessagesContents(pub HashMap<String, GroupMessageContent>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessagesOutput {
    messages_by_group: MessagesByGroup,
    group_messages_contents: GroupMessagesContents,
}

//--------------------------------------------------------------------------

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMsgBatchFetchFilter {
    pub group_id: EntryHash,
    // the last message of the last batch
    pub last_fetched: Option<EntryHash>,
    pub last_message_timestamp: Option<Timestamp>,
    // usize?
    pub batch_size: u8,
    pub payload_type: PayloadType,
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
    payload_input: PayloadInput,
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
