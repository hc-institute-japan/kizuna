pub mod handlers;

use hdk3::prelude::*;
#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct CapFor(CapSecret, AgentPubKey);

#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct Claims(pub Vec<CapClaim>);
#[derive(serde::Serialize, serde::Deserialize, SerializedBytes)]
pub struct Test {
    pub test: String,
}

impl Test {
    pub fn new(test: String) -> Self {
        Test { test }
    }
}

// impl Claims {
//     fn new(cap_claims: Vec<CapClaim>) -> Self(cap_claims);
// }
