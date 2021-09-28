use hdk::prelude::*;

mod entries;
mod utils;

use contacts::{AgentPubKeysWrapper, BooleanWrapper, Contact};
use entries::contacts;

use contacts::add_contacts::add_contacts_handler;
use contacts::block_contacts::block_contacts_handler;
use contacts::in_blocked::in_blocked_handler;
use contacts::in_contacts::in_contacts_handler;
use contacts::list_added::list_added_handler;
use contacts::list_blocked::list_blocked_handler;
use contacts::remove_contacts::remove_contacts_handler;
use contacts::unblock_contacts::unblock_contacts_handler;

entry_defs![Contact::entry_def()];

#[hdk_extern]
fn add_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    return add_contacts_handler(agent_ids);
}

#[hdk_extern]
fn remove_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    return remove_contacts_handler(agent_ids);
}

#[hdk_extern]
fn block_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    return block_contacts_handler(agent_ids);
}

#[hdk_extern]
fn unblock_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    return unblock_contacts_handler(agent_ids);
}

#[hdk_extern]
fn list_added(_: ()) -> ExternResult<AgentPubKeysWrapper> {
    return list_added_handler();
}

#[hdk_extern]
fn list_blocked(_: ()) -> ExternResult<AgentPubKeysWrapper> {
    return list_blocked_handler();
}

#[hdk_extern]
fn in_contacts(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    return in_contacts_handler(agent_pubkey);
}

#[hdk_extern]
fn in_blocked(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    return in_blocked_handler(agent_pubkey);
}
