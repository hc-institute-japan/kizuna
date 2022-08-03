use hdk::prelude::{timestamp::Timestamp, *};
use group_integrity_types::Group;

// IO type definitions

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMembersIO {
    pub members: Vec<AgentPubKey>,
    pub group_id: EntryHash,
    pub group_revision_id: ActionHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGroupNameIO {
    name: String,
    group_id: EntryHash,
    group_revision_id: ActionHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGroupAvatarIO {
    avatar: String,
    group_id: EntryHash,
    group_revision_id: ActionHash,
}

// input type definitions

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateGroupInput {
    name: String,
    members: Vec<AgentPubKey>,
}

// output type definitions

#[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateGroupOutput {
    pub content: Group,
    pub group_revision_id: ActionHash,
    pub group_id: EntryHash,
}

#[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupOutput {
    pub group_id: EntryHash,
    pub group_revision_id: ActionHash,
    pub latest_name: String,
    pub members: Vec<AgentPubKey>,
    pub creator: AgentPubKey,
    pub created: Timestamp,
    pub avatar: Option<String>, 
    // group_versions: Vec<Group>, // TODO: implement this
}

impl GroupOutput {
    pub fn new(group: Group, group_id: EntryHash, group_revision_id: ActionHash) -> GroupOutput {
        GroupOutput {
            group_id,
            group_revision_id,
            latest_name: group.name,
            members: group.members,
            creator: group.creator,
            created: group.created,
            avatar: group.avatar,
        }
    }
}


