use hdk::prelude::*;
pub mod create_key;
pub mod decrypt_file;
pub mod decrypt_key;
pub mod decrypt_message;
pub mod encrypt_file;
pub mod encrypt_key;
pub mod encrypt_message;
pub mod get_agent_key;
pub mod get_my_group_keys;
pub mod init;

use super::group_message::{EncryptedGroupMessage, GroupMessage};

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct IdentityKey {
    pub agent: AgentPubKey,
    pub key: X25519PubKey,
}

// identity keys used for assymetric encryption of group keys
entry_def!(IdentityKey
    EntryDef {
        id: "identitykey".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct GroupKey {
    session_id: u32,
    key: XSalsa20Poly1305KeyRef,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct EncryptedGroupKey {
    session_id: u32,
    key: XSalsa20Poly1305EncryptedData,
}

entry_def!(EncryptedGroupKey
    EntryDef {
        id: "encryptedgroupkey".into(),
        visibility: EntryVisibility::Public,
        crdt_type: CrdtType,
        required_validations: RequiredValidations::default(),
        required_validation_type: RequiredValidationType::Element
    }
);

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct EncryptInput {
    sender: AgentPubKey,
    recipient: AgentPubKey,
    data: XSalsa20Poly1305Data,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct DecryptInput {
    sender: AgentPubKey,
    recipient: AgentPubKey,
    data: XSalsa20Poly1305EncryptedData,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct EncryptMessageInput {
    pub group_id: EntryHash,
    pub message: GroupMessage,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct DecryptMessageInput {
    pub group_id: EntryHash,
    pub message: EncryptedGroupMessage,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct EncryptFileInput {
    pub group_id: EntryHash,
    pub file_bytes: SerializedBytes,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct DecryptFileInput {
    pub group_id: EntryHash,
    pub session_id: u32,
    pub encrypted_file_bytes: XSalsa20Poly1305EncryptedData,
}
