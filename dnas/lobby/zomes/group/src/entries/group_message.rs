use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;
// found in ../../commons/file_types
// TODO: use this instead of defining file payload related types here.
// use file_types::{
// whatever type you need here
// };

pub mod handlers;

//ENUMS
// TODO: this is already defined in the commoncs/file_types so delete this and use that instead
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub enum PayloadType {
    Text,
    File,
    All,
}

// TODO: this is already defined in the commoncs/file_types so delete this and use that instead
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
enum Payload {
    Text {
        payload: String,
    },
    File {
        file_name: String,
        file_size: usize,
        file_type: String,
        bytes: Vec<u8>, // actual bytes of file (15mb limit)
    },
}
// GROUP MESSAGE TYPE DEFINITION, GETTERS, SETTERS, ENTRY_DEF, UTILS ...
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
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
// END OF GROUP MESSAGE TYPE DEFINITION

// TODO: Define the GroupFileBytes.

// START OF INPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageInput {
    group_hash: EntryHash,
    // TODO: change this to payload_input: PayloadInput(found in commons/file_types)
    payload: Payload,
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

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupTypingDetailData {
    pub group_id: EntryHash,
    pub indicated_by: AgentPubKey,
    pub members: Vec<AgentPubKey>,
    pub is_typing: bool,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageReadData {
    pub group_id: EntryHash,
    pub message_ids: Vec<EntryHash>,
    pub reader: AgentPubKey,
    pub timestamp: Timestamp,
    pub members: Vec<AgentPubKey>,
}
// END OF INPUTS TYPES DEFINITION

// OUTPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageData {
    // entry_hash of GroupMessage
    pub id: EntryHash,
    pub content: GroupMessage,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageDataWrapper(Vec<GroupMessageData>);
// END OF OUTPUTS TYPES DEFINITION

// pub struct GroupMessageHash(EntryHash);

// pub struct GroupEntryHash(EntryHash);

// pub struct ReadList(HashMap<AgentPubKey, Timestamp>);
// pub struct GroupMessageContent(GroupMessageElement, ReadList);

// pub struct MessagesByGroup(HashMap<GroupEntryHash, Vec<GroupMessageHash>>);
// pub struct GroupMessagesContents(HashMap<GroupMessageHash, GroupMessageContent>);

// pub struct GroupMessagesOutput(MessagesByGroup, GroupMessagesContents);
