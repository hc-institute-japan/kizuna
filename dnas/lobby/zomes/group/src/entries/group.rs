use hdk3::prelude::*;
use hdk3::prelude::timestamp::Timestamp;
use core::iter::Map;


pub mod handlers;

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
    // TATS: this should be HeaderHash if the archi changes push through.
    group_entry_hash: EntryHash,
    secret_hash: SecretHash
}
#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct Group{
    pub name: String, 
    pub created: Timestamp,
    pub creator: AgentPubKey,
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
// TATS: this may be gone and we may just use XSalsa20Poly1305KeyRef as it is
// if the archi changes push through.
pub struct SecretHash(pub XSalsa20Poly1305KeyRef);

#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct GroupSecretKey{
    pub group_hash:EntryHash,
    pub key_hash:XSalsa20Poly1305KeyRef
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
    // TATS: should be HeaderHash if the architecture changes pushes through. 
    pub group_hash: EntryHash, // this should not change -> checked with validation
    // TATS: this will be taken out if the architectural changes push through.
    pub secret_hash: SecretHash,//this is the hash where the encription_key its storages
    pub members: Vec<AgentPubKey>
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

#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct GroupListOutput( pub Vec<Group>);


// type definitions used in fn request_secret_hash 
//pub struct Secrets (pub Map<XSalsa20Poly1305KeyRef, XSalsa20Poly1305EncryptedData >);

#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct HashesWrapper(Vec<EntryHash>);



