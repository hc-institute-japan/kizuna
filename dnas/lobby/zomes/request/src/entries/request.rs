pub mod handlers;

use hdk3::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Claims(pub Vec<CapClaim>);

#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct Grants(pub Vec<CapGrant>);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct ClaimFrom(CapClaim, AgentPubKey);

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct BooleanWrapper(pub bool);
