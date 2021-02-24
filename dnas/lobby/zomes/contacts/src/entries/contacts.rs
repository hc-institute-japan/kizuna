use hdk3::prelude::*;
use timestamp::Timestamp;
pub mod handlers;

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct AgentPubKeysWrapper(pub Vec<AgentPubKey>);

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, SerializedBytes)]
pub enum ContactType {
    Add,
    Remove,
    Block,
    Unblock,
}

#[hdk_entry(id = "contact", visibility = "private")]
#[derive(Clone, Debug)]
pub struct Contact {
    agent_ids: Vec<AgentPubKey>,
    created: Timestamp,
    contact_type: ContactType,
}

impl Contact {
    pub fn new(
        timestamp: Timestamp,
        agent_ids: Vec<AgentPubKey>,
        contact_type: ContactType,
    ) -> Self {
        Contact {
            agent_ids,
            created: timestamp,
            contact_type,
        }
    }
}
