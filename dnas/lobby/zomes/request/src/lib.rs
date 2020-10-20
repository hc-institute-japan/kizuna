use entries::request;
use request::{handlers, CapFor, Payload, Claims};
mod entries;
use hdk3::prelude::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(handlers::init(())?)
}

#[hdk_extern]
fn accept_cap_claim(claim: CapClaim) -> ExternResult<HeaderHash> {
    Ok(handlers::accept_cap_claim(claim)?)
}

#[hdk_extern]
fn needs_cap_claim(_: ()) -> ExternResult<Payload> {
    Ok(Payload {
        code: "test".to_owned(),
        message: "working".to_owned()
    })
}

#[hdk_extern]
fn send_message(cap_for: CapFor) -> ExternResult<Payload> {
    Ok(handlers::send_message(cap_for)?)
}

#[hdk_extern]
fn receive_request(agent: AgentPubKey) -> ExternResult<()> {
    Ok(handlers::receive_request(agent)?)
}

#[hdk_extern]
fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    Ok(handlers::get_cap_claims(())?)
}

