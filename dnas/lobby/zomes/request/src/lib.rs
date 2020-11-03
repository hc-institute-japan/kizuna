mod entries;
use entries::request;
use request::{
    handlers, 
    ClaimFrom, 
    Claims,
    Grants
};
use hdk3::prelude::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(handlers::init(())?)
}

#[hdk_extern]
fn send_request_to_chat(agent: AgentPubKey) -> ExternResult<HeaderHash> {
    Ok(handlers::send_request_to_chat(agent)?)
}

#[hdk_extern]
fn receive_request_to_chat(claim_from: ClaimFrom) -> ExternResult<CapClaim> {
    Ok(handlers::receive_request_to_chat(claim_from)?)
}

#[hdk_extern]
fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    Ok(handlers::get_cap_claims(())?)
}

#[hdk_extern]
fn get_cap_grants(_: ()) -> ExternResult<Grants> {
    Ok(handlers::get_cap_grants(())?)
}

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(HdkError::Wasm(WasmError::Zome(String::from(reason))))
}
