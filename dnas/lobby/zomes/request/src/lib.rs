use hdk::prelude::*;

mod utils;
mod entries;

use entries::request;

use request::init::init_handler;
use request::try_cap_claim::try_cap_claim_handler;
use request::get_cap_claims::get_cap_claims_handler;
use request::send_request_to_chat::send_request_to_chat_handler;
use request::receive_request_to_chat::receive_request_to_chat_handler;

use request::{
    CapFor, 
    Payload, 
    Claims
};


#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    return init_handler();
}

#[hdk_extern]
fn needs_cap_claim(_: ()) -> ExternResult<Payload> {
    Ok(Payload {
        code: "test".to_owned(),
        message: "working".to_owned()
    })
}

#[hdk_extern]
fn send_request_to_chat(agent: AgentPubKey) -> ExternResult<HeaderHash> {
    return send_request_to_chat_handler(agent);
}

#[hdk_extern]
fn receive_request_to_chat(agent: AgentPubKey) -> ExternResult<CapClaim> {
    return receive_request_to_chat_handler(agent);
}

#[hdk_extern]
fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    return get_cap_claims_handler();
}

#[hdk_extern]
fn try_cap_claim(cap_for: CapFor) -> ExternResult<Payload> {
    return try_cap_claim_handler(cap_for);
}
