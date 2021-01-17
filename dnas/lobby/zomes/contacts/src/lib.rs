#![allow(unused_imports)]
#![allow(dead_code)]
use contacts::{
    AgentPubKeyWrapper,
    BooleanWrapper,
    Contact,
    Profile,
    UsernameWrapper,
};
use crate::utils::to_timestamp;
use entries::contacts;
use hdk3::prelude::*;

mod entries;
mod utils;

entry_defs![Contact::entry_def()];

// temporarily passing agent_pubkey instead of username because of #397 in holochain/holochain
// TODO: change back to username once issue is fixed.
#[hdk_extern]
fn add_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    Ok(contacts::handlers::add_contact(username)?)
}

#[hdk_extern]
fn remove_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    Ok(contacts::handlers::remove_contact(username)?)
}

#[hdk_extern]
fn block_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    Ok(contacts::handlers::block_contact(username)?)
}

#[hdk_extern]
fn unblock_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    Ok(contacts::handlers::unblock_contact(username)?)
}

#[hdk_extern]
fn list_contacts(_: ()) -> ExternResult<AgentPubKeyWrapper> {
    Ok(contacts::handlers::list_added()?)
}

#[hdk_extern]
fn list_blocked(_: ()) -> ExternResult<AgentPubKeyWrapper> {
    Ok(contacts::handlers::list_blocked()?)
}

#[hdk_extern]
fn in_contacts(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    Ok(contacts::handlers::in_contacts(agent_pubkey)?)
}

#[hdk_extern]
fn in_blocked(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    Ok(contacts::handlers::in_blocked(agent_pubkey)?)
}

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(HdkError::Wasm(WasmError::Zome(String::from(reason))))
}
