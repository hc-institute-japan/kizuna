#![allow(unused_imports)]
#![allow(dead_code)]

use entries::request;
use request::{handlers, AgentKey, AgentKeyWrapper, Members, Payload, PayloadWrapper};

mod entries;

use hdk3::prelude::{EntryDef, *};

#[hdk_extern]
fn send_request(sender: AgentKeyWrapper) -> ExternResult<Payload> {
    Ok(handlers::send_request(sender)?)
}

#[hdk_extern]
fn accept_request(sender: AgentKeyWrapper) -> ExternResult<Payload> {
    Ok(handlers::accept_request(sender)?)
}

#[hdk_extern]
fn get_agent_key(_: ()) -> ExternResult<AgentKey> {
    Ok(handlers::get_agent_key(())?)
}
