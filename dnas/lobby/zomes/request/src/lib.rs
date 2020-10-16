#![allow(dead_code)]

use entries::request;
use request::{handlers, CapFor, Claims, Test};
mod entries;
use hdk3::prelude::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(handlers::init(())?)
}

#[hdk_extern]
fn accept_cap_claim(claim: CapClaim) -> ExternResult<HeaderHash> {
    debug!("-- [ACCEPT_CAP_CLAIM] --\n")?;

    debug!("-- [END ACCEPT_CAP_CLAIM] --\n")?;
    Ok(create_cap_claim!(claim)?)
}

#[hdk_extern]
pub fn cap_secret(_: ()) -> ExternResult<CapSecret> {
    Ok(generate_cap_secret!()?)
}

fn cap_grant_entry(secret: CapSecret) -> ExternResult<CapGrantEntry> {
    Ok(handlers::create_grant_entry(secret)?)
}

#[hdk_extern]
pub fn transferable_cap_grant(secret: CapSecret) -> ExternResult<HeaderHash> {
    Ok(create_cap_grant!(cap_grant_entry(secret)?)?)
}

#[hdk_extern]
pub fn roll_cap_grant(header_hash: HeaderHash) -> ExternResult<HeaderHash> {
    Ok(update_cap_grant!(
        header_hash,
        cap_grant_entry(generate_cap_secret!()?)?
    )?)
}

#[hdk_extern]
pub fn delete_cap_grant(header_hash: HeaderHash) -> ExternResult<HeaderHash> {
    Ok(delete_cap_grant!(header_hash)?)
}

#[hdk_extern]
fn needs_cap_claim(_: ()) -> ExternResult<()> {
    Ok(())
}

#[hdk_extern]
fn send_message(cap_for: CapFor) -> ExternResult<ZomeCallResponse> {
    Ok(handlers::send_message(cap_for)?)
}

#[hdk_extern]
fn send_request(agent: AgentPubKey) -> ExternResult<()> {
    Ok(handlers::send_request(agent)?)
}

#[hdk_extern]
fn receive_request(agent: AgentPubKey) -> ExternResult<()> {
    Ok(handlers::receive_request(agent)?)
}

#[hdk_extern]
fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    Ok(handlers::get_cap_claims(())?)
}

#[hdk_extern]
fn is_updating(_: ()) -> ExternResult<Test> {
    Ok(Test {
        test: "nagbago2".to_owned(),
    })
}
