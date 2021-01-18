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
    Profile,
    UsernameWrapper,
};
use crate::utils::to_timestamp;
use hdk3::prelude::*;

pub(crate) fn add_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    // return Err if the given username is not linked to any agent
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_latest_contact = get_latest_contact_info(&agent_pubkey)?;
    let profile: Profile = Profile::new(agent_pubkey.clone(), username.0);
    if let Some(contact) = maybe_latest_contact {
        match contact.contact_type {
            ContactType::Add => {
                // return the given username and agent pubkey right away
                return Ok(profile)
            },
            ContactType::Block => {
                // return Profile but with both fields set to None
                return Ok(Profile::default())
            },
            _ => (),
        }
    }
    let added_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_pubkey,
        ContactType::Add
    );
    create_entry(&added_contact)?;
    Ok(profile)
}

pub(crate) fn remove_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_latest_contact = get_latest_contact_info(&agent_pubkey)?;
    let profile: Profile = Profile::new(agent_pubkey.clone(), username.0);
    
    if let Some(contact) = maybe_latest_contact {
        match contact.contact_type {
            // return the given profile if removed or unblocked
            ContactType::Remove | ContactType::Unblock => { return Ok(profile) },
            // return empty Profile if given username is blocked
            ContactType::Block => { return Ok(Profile::default()) },
            _ => (),

        }
    } else {
        // if None return Profile with given arg
        return Ok(profile)
    }
    let removed_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_pubkey,
        ContactType::Remove,
    );
    create_entry(&removed_contact)?;
    Ok(profile)
}

pub(crate) fn block_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;
    let me = agent_info()?.agent_latest_pubkey;

    // return right away if trying to block oneself
    if me == agent_pubkey { return Ok(Profile::default()) }

    let maybe_latest_contact = get_latest_contact_info(&agent_pubkey)?;
    let profile: Profile = Profile::new(agent_pubkey.clone(), username.0);
    
    if let Some(contact) = maybe_latest_contact {
        match contact.contact_type {
            // return the given username and pubkey if already blocked
            ContactType::Block => { return Ok(profile) },
            _ => (),

        }
    }
    // in other cases always block the given username
    let blocked_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_pubkey,
        ContactType::Block,
    );
    create_entry(&blocked_contact)?;
    Ok(profile)
}

pub(crate) fn unblock_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_latest_contact = get_latest_contact_info(&agent_pubkey)?;
    let profile: Profile = Profile::new(agent_pubkey.clone(), username.0); 
    
    if let Some(contact) = maybe_latest_contact {
        match contact.contact_type {
            // return the given username and pubkey if already unblocked
            ContactType::Unblock | ContactType::Remove => { return Ok(profile) },
            ContactType::Add => { return Ok(Profile::default()) },
            _ => (),
        }
    } else {
        return Ok(profile)
    }

    let unblocked_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_pubkey,
        ContactType::Unblock,
    );
    create_entry(&unblocked_contact)?;
    Ok(profile)    
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
fn get_latest_contact_info(
    agent_pubkey: &AgentPubKey
) -> ExternResult<Option<Contact>> {
    let maybe_contacts = query_contacts()?
        .into_iter()
        .filter_map(|c| {
            if &c.agent_id == agent_pubkey { Some(c) } else { None }
        })
        .collect::<Vec<Contact>>();
    // can return index 0 as query() orders from latest to oldest
    // max_by_key() could be used which is more accurate but also expensive
    // NOTE: can break with breaking change on query
    if let Some(c) = maybe_contacts.get(0) {
        Ok(Some(c.to_owned()))
    } else {
        Ok(None)
    }
} 

fn get_agent_pubkey_from_username(
    username: UsernameWrapper,
) -> ExternResult<AgentPubKey> {
    let function_name = zome::FunctionName("get_agent_pubkey_from_username".to_owned());
    // needs to handle error from get_agent_pubkey_from_username in UI
    let agent_pubkey = hdk3::prelude::call(
        None,
        "username".into(),
        function_name,
        None,
        &username
    )?;
    Ok(agent_pubkey)
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

    for contact in sorted_contacts {
        let maybe_agent_contact = agents_to_contact_types.entry(contact.agent_id.clone());
        match maybe_agent_contact {
            hash_map::Entry::Occupied(o) => {
                let contact_types: &mut Vec<Contact> = o.into_mut();
                contact_types.push(contact);
            },
            hash_map::Entry::Vacant(v) => {
                let mut new_contact_types: Vec<Contact> = Vec::new();
                new_contact_types.insert(0, contact);
                v.insert(new_contact_types);
            },
        }
    };

    let filtered_agents = agents_to_contact_types
        .into_iter()
        .filter_map(|agent_contact_types| {
            let latest_status = agent_contact_types.1.into_iter().max_by_key(|c| c.created);
            if let Some(c) = latest_status {
                if ContactType::Add == filter && ContactType::Add == c.contact_type  {
                    return Some(c.agent_id)
                } else if ContactType::Block == filter  && ContactType::Block == c.contact_type {
                    return Some(c.agent_id)
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