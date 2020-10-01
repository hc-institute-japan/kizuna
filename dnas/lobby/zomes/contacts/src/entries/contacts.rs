use hdk3::prelude::*;
use timestamp::Timestamp;
pub mod handlers;

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct AgentIdWrapper(pub AgentPubKey);
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct UsernameWrapper(pub String);

// TODO: change to AgentPubKey
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct ContactsWrapper(pub Vec<String>);

// TODO: change to AgentPubKey
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BlockedWrapper(pub Vec<String>);

#[derive(Deserialize, Serialize, Clone, Debug, SerializedBytes)]
pub struct Profile {
    // agent_id: AgentPubKey,
    username: String,
}


impl Profile {
    // TODO: add agent_pubkey
    pub fn new (username: String) -> Self {
        Profile {
            // agent_id: agent_pubkey,
            username,
        }
    }
}

#[hdk_entry(id="contacts", visibility="private")]
#[derive(Clone, Debug)]
pub struct ContactsInfo {
    agent_id: AgentPubKey,
    timestamp: Timestamp,
    // TODO: currently storing username until get_agent_pubkey_from_username is working.
    contacts: Vec<String>,
    blocked: Vec<String>,
}

impl ContactsInfo {
    pub fn new(timestamp: Timestamp) -> Result<Self, SerializedBytesError> {
        let agent_info = agent_info!()?;
        Ok(ContactsInfo {
            agent_id: agent_info.agent_latest_pubkey,
            timestamp,
            contacts: Vec::default(),
            blocked: Vec::default(),
        })
    }

    // change this once get agent pubkey from username is working.
    pub fn from(timestamp: Timestamp, contacts: Vec<String>, blocked: Vec<String>) -> Result<Self, SerializedBytesError> {
        let agent_info = agent_info!()?;
        Ok(ContactsInfo {
            agent_id: agent_info.agent_latest_pubkey,
            timestamp,
            contacts,
            blocked,
        })
    }
}

