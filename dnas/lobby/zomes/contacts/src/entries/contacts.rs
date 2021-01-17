use hdk3::prelude::*;
use timestamp::Timestamp;
pub mod handlers;

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);
#[derive(Deserialize, Serialize, SerializedBytes, Clone)]
pub struct UsernameWrapper(pub String);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct AgentPubKeyWrapper(pub Vec<AgentPubKey>);

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

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, SerializedBytes)]
pub enum ContactType {
	Add,
	Remove,
	Block,
	Unblock
}

#[hdk_entry(id = "contact", visibility = "private")]
#[derive(Clone, Debug)]
pub struct Contact {
    agent_id: AgentPubKey,
    created: Timestamp,
    contact_type: ContactType
}

impl Contact {
    pub fn new(timestamp: Timestamp, agent_id: AgentPubKey, contact_type: ContactType) -> Self {
        Contact {
            agent_id,
            created: timestamp,
            contact_type
        }
    }
}
