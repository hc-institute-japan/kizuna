use hdk3::prelude::*;
use hdk3::prelude::timestamp::Timestamp;

pub mod handlers;

//GROUP TYPE DEFINITION, GETTERS, SETTERS, ENTRY_DEF, UTILS ... 
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub struct Group {
    pub name: String, 
    pub created: Timestamp,
    pub creator: AgentPubKey,
    pub members: Vec<AgentPubKey>
}

impl Group {
    pub fn new(name: String, created: Timestamp, creator: AgentPubKey, members: Vec<AgentPubKey>) -> Self {
        Group{
            name,
            created,
            creator,
            members,
        }
    }
    //GETTERS
    pub fn get_group_creation_timestamp(&self) -> Timestamp { self.created.clone() }
    pub fn get_group_creator(&self) -> AgentPubKey { self.creator.clone() }
    pub fn get_group_members(&self) -> Vec<AgentPubKey> { self.members.clone() }
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
//END OF GROUP TYPE DEFINITION 

//INPUTS TYPES DEFINITION
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub struct CreateGroupInput {
    name: String,
    members: Vec<AgentPubKey>   
}
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub struct AddMemberInput {
    members: Vec<AgentPubKey>,
    group_id: EntryHash,
    group_revision_id: HeaderHash,
}
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub struct UpdateGroupNameInput {
    name: String,
    group_id: EntryHash,
    group_revision_id: HeaderHash,
}
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub struct RemoveMembersInput {
    members: Vec<AgentPubKey>,
    group_id: EntryHash,
    group_revision_id: HeaderHash,
}

//END OF INPUTS TYPES DEFINITION

//OUTPUTS TYPES DEFINITION
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct HashesOutput {
    pub header_hash: HeaderHash,
    pub entry_hash: EntryHash,
}
//END OF OUTPUTS TYPES DEFINITION

//WRAPPERS TYPES DEFINITION
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BlockedWrapper (pub Vec<AgentPubKey>);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct MyGroupListWrapper (pub Vec<Group>);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct AgentPubKeysWrapper (Vec<AgentPubKey>);
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct EntryHashWrapper {
    pub group_hash: EntryHash,
}

//END OF WRAPPERS TYPES DEFINITION
