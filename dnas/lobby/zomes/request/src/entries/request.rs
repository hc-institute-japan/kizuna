pub mod handlers;

use hdk3::prelude::*;
#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct CapFor(CapSecret, AgentPubKey);

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Claims(pub Vec<CapClaim>);

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Payload {
    pub code: String,
    pub message: String
}
