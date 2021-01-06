use hdk3::prelude::*;
use timestamp::Timestamp;
pub mod handlers;

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);
#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct UsernameWrapper(pub String);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct ContactsWrapper(pub Vec<AgentPubKey>);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BlockedWrapper(pub Vec<AgentPubKey>);

#[derive(Deserialize, Serialize, Clone, Debug, SerializedBytes, Default)]
pub struct Profile {
    agent_id: Option<AgentPubKey>,
    username: Option<String>,
}

impl Profile {
    pub fn new(agent_id: AgentPubKey, username: String) -> Self {
        Profile {
            agent_id: Some(agent_id),
            username: Some(username),
        }
    }
}

#[hdk_entry(id = "contacts", visibility = "private")]
#[derive(Clone, Debug)]
pub struct ContactsInfo {
    agent_id: AgentPubKey,
    timestamp: Timestamp,
    contacts: Vec<AgentPubKey>,
    blocked: Vec<AgentPubKey>,
}

impl ContactsInfo {
    pub fn new(timestamp: Timestamp) -> Result<Self, HdkError> {
        let agent_info = agent_info()?;
        Ok(ContactsInfo {
            agent_id: agent_info.agent_latest_pubkey,
            timestamp,
            contacts: Vec::default(),
            blocked: Vec::default(),
        })
    }

    pub fn from(
        timestamp: Timestamp,
        contacts: Vec<AgentPubKey>,
        blocked: Vec<AgentPubKey>,
    ) -> Result<Self, HdkError> {
        let agent_info = agent_info()?;
        Ok(ContactsInfo {
            agent_id: agent_info.agent_latest_pubkey,
            timestamp,
            contacts,
            blocked,
        })
    }
}
