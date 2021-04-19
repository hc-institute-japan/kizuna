use hdk::prelude::*;

pub mod init;
pub mod try_cap_claim;
pub mod get_cap_claims;
pub mod send_request_to_chat;
pub mod receive_request_to_chat;

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct CapFor(CapSecret, AgentPubKey);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct Claims(pub Vec<CapClaim>);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct Payload {
    pub code: String,
    pub message: String
}
