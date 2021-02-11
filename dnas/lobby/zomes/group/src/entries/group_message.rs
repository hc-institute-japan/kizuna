use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;
// found in ../../commons/file_types
// use file_types::*;

pub mod handlers;

//ENUMS
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
enum Payload {
    Text {
        payload: String,
    },
    // do we still separate by file type (e.g. photo, video, document)?
    File {
        file_name: String,
        file_size: usize,
        // if the file types accomodated is sure,
        // we can have this as enum
        file_type: String,
        bytes: Vec<u8>, // actual bytes of file (15mb limit)
    },
}
//GROUP MESSAGE TYPE DEFINITION, GETTERS, SETTERS, ENTRY_DEF, UTILS ...
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
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
//END OF GROUP MESSAGE TYPE DEFINITION

//START OF INPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMessageInput {
    group_hash: EntryHash,
    payload: Payload,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}
//END OF INPUTS TYPES DEFINITION

//OUTPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageData {
    // entry_hash of GroupMessage
    id: EntryHash,
    content: GroupMessage,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageDataWrapper(Vec<GroupMessageData>);
//END OF OUTPUTS TYPES DEFINITION
