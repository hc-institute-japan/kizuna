use crate::utils::error;
use hdk::prelude::*;
use std::collections::{hash_map, HashMap};

use super::{AgentPubKey, AgentPubKeysWrapper, Contact, ContactType};

pub fn check_latest_state(
    agent_pubkeys: &AgentPubKeysWrapper,
    check_for: ContactType,
) -> ExternResult<()> {
    let mut agents_to_contact_type: HashMap<AgentPubKey, Option<Contact>> =
        std::collections::HashMap::new();
    let sorted_contacts: Vec<Contact> = query_contacts()?;

    for agent in &agent_pubkeys.0 {
        let maybe_contacts = sorted_contacts
            .clone()
            .into_iter()
            .filter_map(|c| {
                if c.agent_ids.contains(&agent) {
                    Some(c)
                } else {
                    None
                }
            })
            .collect::<Vec<Contact>>();

        // can return index 0 as query() orders from latest to oldest
        // max_by_key() could be used which is more accurate but also expensive
        // NOTE: can break with breaking change on query

        if maybe_contacts.get(0).is_some() {
            let contact: Contact = maybe_contacts.get(0).unwrap().clone();
            agents_to_contact_type.insert(agent.to_owned(), Some(contact));
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
        }
        ContactType::Remove => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    match contact.contact_type {
                        ContactType::Remove | ContactType::Unblock => {
                            return error("agent is not added")
                        }
                        ContactType::Block => return error("agent is blocked"),
                        _ => (),
                    }
                } else {
                    return error("agent is not added");
                }
            }
        }
        ContactType::Block => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    if let ContactType::Block = contact.contact_type {
                        return error("this agent is already blocked");
                    }
                }
            }
        }
        ContactType::Unblock => {
            for agent_contact in agents_to_contact_type {
                if let Some(contact) = agent_contact.1 {
                    match contact.contact_type {
                        ContactType::Block => (),
                        _ => return error("agent is not blocked"),
                    }
                } else {
                    return error("agent is not blocked");
                }
            }
        }
    }

    Ok(())
}

pub fn query_contacts() -> ExternResult<Vec<Contact>> {
    let filter = QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(0),
            zome_info()?.zome_id,
            EntryVisibility::Private,
        )))
        .include_entries(true)
        .header_type(HeaderType::Create);

    let contacts: Vec<Contact> = query(filter)?
        .into_iter()
        .filter_map(|e| {
            if let Ok(Some(contact)) = e.into_inner().1.to_app_option::<Contact>() {
                return Some(contact);
            } else {
                None
            }
        })
        .collect::<Vec<Contact>>();

    debug!("contacts query contacts {:?}", contacts.clone());
    Ok(contacts)
}

pub fn list_added_or_blocked(filter: ContactType) -> ExternResult<AgentPubKeysWrapper> {
    let mut agents_to_contact_types: HashMap<AgentPubKey, Vec<Contact>> =
        std::collections::HashMap::new();
    let sorted_contacts: Vec<Contact> = query_contacts()?;
    debug!(
        "contacts list added or blocked sorted_contacts {:?}",
        sorted_contacts.clone()
    );

    for contact in sorted_contacts {
        for agent_id in &contact.agent_ids {
            let maybe_agent_contact = agents_to_contact_types.entry(agent_id.to_owned());
            match maybe_agent_contact {
                hash_map::Entry::Occupied(o) => {
                    let contact_types: &mut Vec<Contact> = o.into_mut();
                    contact_types.push(contact.clone());
                }
                hash_map::Entry::Vacant(v) => {
                    let mut new_contact_types: Vec<Contact> = Vec::new();
                    new_contact_types.insert(0, contact.clone());
                    v.insert(new_contact_types);
                }
            }
        }
    }

    let filtered_agents = agents_to_contact_types
        .into_iter()
        .filter_map(|agent_contact_types| {
            let latest_status = agent_contact_types.1.into_iter().max_by_key(|c| c.created);
            if let Some(c) = latest_status {
                if ContactType::Add == filter && ContactType::Add == c.contact_type {
                    return Some(agent_contact_types.0);
                } else if ContactType::Block == filter && ContactType::Block == c.contact_type {
                    return Some(agent_contact_types.0);
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    debug!("contacts list added or blocked {:?}", filtered_agents);
    Ok(AgentPubKeysWrapper(filtered_agents))
}
