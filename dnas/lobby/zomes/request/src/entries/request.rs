pub mod handlers;

use hdk3::prelude::*;
#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct CapFor(CapSecret, AgentPubKey);

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Claims(pub Vec<CapClaim>);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct ClaimFrom(CapClaim, AgentPubKey);

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Payload {
    pub code: String,
    pub message: String
}
