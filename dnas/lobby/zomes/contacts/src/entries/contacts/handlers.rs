#![allow(unused_imports)]
#![allow(dead_code)]
use std::collections::{
    HashMap,
    hash_map,
};

use super::{
    BooleanWrapper,
    AgentPubKeysWrapper,
    Contact,
    ContactType,
};

use crate::{
    error,
    utils::to_timestamp,
};

use hdk3::prelude::*;

pub(crate) fn add_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    check_latest_state(&agent_ids, ContactType::Add)?;
    let added_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Add
    );
    create_entry(&added_contact)?;
    Ok(agent_ids)
}

pub(crate) fn remove_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    check_latest_state(&agent_ids, ContactType::Remove)?;

    let removed_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Remove,
    );
    create_entry(&removed_contact)?;
    Ok(agent_ids)
}

pub(crate) fn block_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    let me = agent_info()?.agent_latest_pubkey;
    // return err right away if trying to block oneself
    if let true = agent_ids.0.contains(&me) { return error("cannot block yourself") }

    check_latest_state(&agent_ids, ContactType::Block)?;
    let blocked_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Block,
    );
    create_entry(&blocked_contact)?;
    Ok(agent_ids)
}

pub(crate) fn unblock_contacts(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    check_latest_state(&agent_ids, ContactType::Unblock)?;
    let unblocked_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Unblock,
    );
    create_entry(&unblocked_contact)?;
    Ok(agent_ids)    
}

pub(crate) fn list_added() -> ExternResult<AgentPubKeysWrapper> {
    Ok(list_added_or_blocked(ContactType::Add)?)
}

pub(crate) fn list_blocked() -> ExternResult<AgentPubKeysWrapper> {
    Ok(list_added_or_blocked(ContactType::Block)?)
}

pub(crate) fn in_contacts(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    let contacts_list = list_added()?.0;
    if contacts_list.len() == 0 {
        Ok(BooleanWrapper(false))
    } else {
        if contacts_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
            Ok(BooleanWrapper(true))
        } else {
            Ok(BooleanWrapper(false))
        }
    }
}

pub(crate) fn in_blocked(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    let blocked_list = list_blocked()?.0;
    if blocked_list.len() == 0 {
        Ok(BooleanWrapper(false))
    } else {
        if blocked_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
            Ok(BooleanWrapper(true))
        } else {
            Ok(BooleanWrapper(false))
        }
    }
}

// HELPER FUNCTION
fn check_latest_state(
    agent_pubkeys: &AgentPubKeysWrapper,
    check_for: ContactType
) -> ExternResult<()> {
    let mut agents_to_contact_type: HashMap<AgentPubKey, Option<Contact>> = std::collections::HashMap::new();
    let sorted_contacts = query_contacts()?;

    for agent in &agent_pubkeys.0 {
        let maybe_contacts = sorted_contacts
        .clone()
        .into_iter()
        .filter_map(|c| {
            if c.agent_ids.contains(&agent) { Some(c) } else { None }
        })
        .collect::<Vec<Contact>>();
        // can return index 0 as query() orders from latest to oldest
        // max_by_key() could be used which is more accurate but also expensive
        // NOTE: can break with breaking change on query
        if let Some(c) = maybe_contacts.get(0) {
            agents_to_contact_type.insert(agent.to_owned(), Some(c.to_owned()));
        } else {
            agents_to_contact_type.insert(agent.to_owned(), None);
        }
    }

    match check_for {
        ContactType::Add => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    match contact.contact_type {
                        ContactType::Add => return error("agent already added"),
                        ContactType::Block => return error("agent is blocked"),
                        _ => (),
                    }
                }
            }
        },
        ContactType::Remove => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    match contact.contact_type {
                        ContactType::Remove | ContactType::Unblock => return error("agent is not added"),
                        ContactType::Block => return error("agent is blocked"),
                        _ => (),
            
                    }
                } else { return error("agent is not added") }
            }
        },
        ContactType::Block => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    if let ContactType::Block = contact.contact_type {
                        return error("this agent is already blocked")
                    }
                }
            }
        },
        ContactType::Unblock => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    match contact.contact_type {
                        ContactType::Block => (),
                        _ => return error("agent is not blocked"),
                    }
                } else {
                    return error("agent is not blocked")
                }
            }
        },
    }

    Ok(())
} 

fn query_contacts() -> ExternResult<Vec<Contact>> {
    let filter = QueryFilter::new()
    .entry_type(EntryType::App(AppEntryType::new(
        EntryDefIndex::from(0),
        ZomeId::from(0),
        EntryVisibility::Private,
    )))
    .include_entries(true)
    .header_type(HeaderType::Create);

    let contacts = query(filter)?
    .0
    .into_iter()
    .filter_map(|e| {
        if let Ok(Some(contact)) = e.into_inner().1.to_app_option::<Contact>() {
            return Some(contact)
        } else { None }
    })
    .collect::<Vec<Contact>>();

    Ok(contacts)
}

fn list_added_or_blocked(filter: ContactType) -> ExternResult<AgentPubKeysWrapper> {
    let mut agents_to_contact_types: HashMap<AgentPubKey, Vec<Contact>> = std::collections::HashMap::new();
    let sorted_contacts = query_contacts()?;

    for contact in &sorted_contacts {
        for agent_id in &contact.agent_ids {
            let maybe_agent_contact = agents_to_contact_types.entry(agent_id.to_owned());
            match maybe_agent_contact {
                hash_map::Entry::Occupied(o) => {
                    let contact_types: &mut Vec<Contact> = o.into_mut();
                    contact_types.push(contact.to_owned());
                },
                hash_map::Entry::Vacant(v) => {
                    let mut new_contact_types: Vec<Contact> = Vec::new();
                    new_contact_types.insert(0, contact.to_owned());
                    v.insert(new_contact_types);
                },
            }
        }
    };

    let filtered_agents = agents_to_contact_types
        .into_iter()
        .filter_map(|agent_contact_types| {
            let latest_status = agent_contact_types.1.into_iter().max_by_key(|c| c.created);
            if let Some(c) = latest_status {
                if ContactType::Add == filter && ContactType::Add == c.contact_type  {
                    return Some(agent_contact_types.0)
                } else if ContactType::Block == filter  && ContactType::Block == c.contact_type {
                    return Some(agent_contact_types.0)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();
    
    Ok(AgentPubKeysWrapper(filtered_agents))
}