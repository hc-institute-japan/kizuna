pub mod handlers;

use hdk3::prelude::*;
#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct CapFor {
    cap_secret: CapSecret,
    agent_pub_key: AgentPubKey
}

#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct Claims(pub Vec<CapClaim>);
#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct Test {
    pub test: String,
}
#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct Payload {
    pub code: String,
    pub message: String
}
