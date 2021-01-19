use hdk3::prelude::*;
use hdk3::prelude::timestamp::Timestamp;

pub mod handlers;

#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct GroupNameWrapper(pub String);

#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct CreateGroupInput {
    pub name: String,
    pub members: Vec<AgentPubKey>   
}

#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct AgentPubKeys(Vec<AgentPubKey>);

#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct AddInitialMembersInput {
    invitee: Vec<AgentPubKey>,
    group_entry_hash: EntryHash,
    secret_hash: SecretHash
}


#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct Group{
    name: String, 
    created: Timestamp,
    creator: AgentPubKey,
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
#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct SecretHash(pub XSalsa20Poly1305KeyRef);


#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct GroupSecretKey{
    group_hash: EntryHash,
    key_hash: XSalsa20Poly1305KeyRef
}

entry_def!(GroupSecretKey 
    EntryDef{
        id: "group_secret_key".into(),
        visibility: EntryVisibility::Private,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);

#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct GroupMembers {
    group_hash: EntryHash, // this should not change -> checked with validation
    secret_hash: SecretHash, // this is the hash where the encription_key its storages
    members: Vec<AgentPubKey>
}

entry_def!(GroupMembers 
    EntryDef{
        id: "group_members".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);



