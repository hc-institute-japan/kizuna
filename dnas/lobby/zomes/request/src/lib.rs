#![allow(unused_imports)]
#![allow(dead_code)]

use entries::request;
use request::{handlers, AgentKey, AgentKeyWrapper, Members, Payload, PayloadWrapper};

mod entries;

use hdk3::prelude::*;

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

#[hdk_extern]
fn create_cap_grant(_: ()) -> ExternResult<()> {
    let mut functions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "receive_request".into()));
    functions.insert((zome_info!()?.zome_name, "send_request".into()));
    functions.insert((zome_info!()?.zome_name, "accept_request".into()));

    debug!("LOG: Creating cap grant")?;
    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions
    })?;
    Ok(())
}
