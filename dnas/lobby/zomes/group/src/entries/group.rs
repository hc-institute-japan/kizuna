use hdk::prelude::timestamp::Timestamp;
use hdk::prelude::*;

pub mod add_members;
pub mod create_group;
pub mod get_all_my_groups;
pub mod group_helpers;
pub mod remove_members;
pub mod update_group_name;
pub mod validations;

/* GROUP TYPE DEFINITION, GETTERS, SETTERS, ENTRY_DEF, UTILS ... */
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    pub name: String,
    pub created: Timestamp,
    pub creator: AgentPubKey,
    pub members: Vec<AgentPubKey>,
}

impl Group {
    pub fn new(
        name: String,
        created: Timestamp,
        creator: AgentPubKey,
        members: Vec<AgentPubKey>,
    ) -> Self {
        Group {
            name,
            created,
            creator,
            members,
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

entry_def!(Group
    EntryDef{
        id: "group".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);
/* END OF GROUP TYPE DEFINITION */

/* IO TYPE DEFINITION */
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMembersIO {
    pub members: Vec<AgentPubKey>,
    pub group_id: EntryHash,
    pub group_revision_id: HeaderHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGroupNameIO {
    name: String,
    group_id: EntryHash,
    group_revision_id: HeaderHash,
}
/* END OF IO TYPES DEFINITION */

/* INPUT TYPES DEFINITION */
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateGroupInput {
    name: String,
    members: Vec<AgentPubKey>,
}
/* END OF INPUT TYPES DEFINITION */

/* OUTPUT TYPES DEFINITION */
#[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateGroupOutput {
    pub content: Group,
    pub group_revision_id: HeaderHash,
    pub group_id: EntryHash,
}
#[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupOutput {
    pub group_id: EntryHash,
    pub group_revision_id: HeaderHash,
    pub latest_name: String,
    pub members: Vec<AgentPubKey>,
    pub creator: AgentPubKey,
    pub created: Timestamp,
    // group_versions: Vec<Group>,
}

impl GroupOutput {
    fn new(group: Group, group_id: EntryHash, group_revision_id: HeaderHash) -> GroupOutput {
        GroupOutput {
            group_id: group_id,
            group_revision_id: group_revision_id,
            latest_name: group.name,
            members: group.members,
            creator: group.creator,
            created: group.created,
        }
    }
}
/* END OF OUTPUT TYPES DEFINITION */
