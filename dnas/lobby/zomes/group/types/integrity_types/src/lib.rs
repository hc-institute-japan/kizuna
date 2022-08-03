use hdi::prelude::*;
/** 
 * Structs and related types for group entries
 */

#[derive(Clone)]
#[hdk_entry_helper]
pub struct Group {
    pub name: String,
    pub created: Timestamp,
    pub creator: AgentPubKey,
    pub members: Vec<AgentPubKey>,
    pub avatar: Option<String>,
}

impl Group {
    pub fn new(name: String, created: Timestamp, creator: AgentPubKey, members: Vec<AgentPubKey>, avatar: Option<String>) 
    -> Self {
        Group {
            name,
            created,
            creator,
            members,
            avatar,
        }
    }
    // GETTERS
    pub fn get_group_creation_timestamp(&self) -> Timestamp {
        self.created.clone()
    }
    pub fn get_group_creator(&self) -> AgentPubKey {
        self.creator.clone()
    }
    pub fn get_group_members(&self) -> Vec<AgentPubKey> {
        self.members.clone()
    }
}

 /**
 * Entry structure related structs for group message entries
 */

#[derive(Clone)]
#[hdk_entry_helper]
pub struct GroupMessage {
    // EntryHash of first ver of Group
    group_hash: EntryHash,
    payload: Payload,
    created: Timestamp,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}

#[derive(Clone)]
#[hdk_entry_helper]
pub struct GroupFileBytes(SerializedBytes);

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
pub enum FileType {
    Image { thumbnail: SerializedBytes },
    Video { thumbnail: SerializedBytes },
    Other,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub file_name: String,
    pub file_size: usize,
    pub file_type: String,
    pub file_hash: EntryHash,
}