use derive_more::{From, Into};
use hdk3::prelude::*;
pub mod handlers;

#[derive(Serialize, Deserialize, From, Into, Clone, SerializedBytes)]
pub struct Members {
    pub members: Vec<AgentPubKey>,
}

impl Members {
    pub fn new(members: Vec<AgentPubKey>) -> Self {
        Members { members }
    }
}

#[derive(Serialize, Deserialize, From, Into, Clone, SerializedBytes)]
pub struct HashWrapper(pub HeaderHash);

#[derive(From, Into, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct AgentKeyWrapper(pub AgentPubKey);

#[derive(Serialize, Deserialize, From, Into, Clone, SerializedBytes)]
pub struct PayloadWrapper {
    pub code: String,
    pub sender: AgentKey,
    pub members: Members,
}

#[derive(Serialize, Deserialize, From, Into, Clone, SerializedBytes)]
pub struct AgentKey {
    pub agent_key: AgentPubKey,
}

impl AgentKey {
    pub fn new(agent_key: AgentPubKey) -> Self {
        AgentKey { agent_key }
    }
}

#[hdk_entry(id = "payload")]
pub struct Payload {
    pub code: String,
    pub sender: AgentPubKey,
    pub members: Members,
}

#[hdk_entry(id = "request")]
pub struct Request {
    pub from: AgentPubKey,
    pub members: Members,
}
