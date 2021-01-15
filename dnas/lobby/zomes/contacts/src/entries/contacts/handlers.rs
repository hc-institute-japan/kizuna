#![allow(unused_imports)]
#![allow(dead_code)]
use super::{
    BlockedWrapper,
    BooleanWrapper,
    ContactsWrapper,
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

// pub(crate) fn list_contacts() -> ExternResult<ContactsWrapper> {
//     let maybe_contacts_info_elements_components = query_contact_info_elements()?;

//     match maybe_contacts_info_elements_components {
//         Some(contacts_info_elements_components) => {
//             let contacts_info = contacts_info_elements_components.1;
//             let contacts = ContactsWrapper(contacts_info.contacts);
//             Ok(contacts)
//         }
//         _ => {
//             // TODO: change to Vec<AgentPubKey>
//             let empty_contacts = ContactsWrapper(Vec::default());
//             Ok(empty_contacts)
//         }
//     }
// }

// pub(crate) fn list_blocked() -> ExternResult<BlockedWrapper> {
//     let maybe_contacts_info_elements_components = query_contact_info_elements()?;

//     match maybe_contacts_info_elements_components {
//         Some(contacts_info_elements_components) => {
//             let contacts_info = contacts_info_elements_components.1;
//             let contacts = BlockedWrapper(contacts_info.blocked);
//             Ok(contacts)
//         }
//         _ => {
//             // TODO: change to Vec<AgentPubKey>
//             let empty_blocked = BlockedWrapper(Vec::default());
//             Ok(empty_blocked)
//         }
//     }
// }

// pub(crate) fn in_contacts(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
//     let contacts_list = list_contacts()?.0;
//     if contacts_list.len() == 0 {
//         Ok(BooleanWrapper(false))
//     } else {
//         if contacts_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
//             Ok(BooleanWrapper(true))
//         } else {
//             Ok(BooleanWrapper(false))
//         }
//     }
// }

// pub(crate) fn in_blocked(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
//     let blocked_list = list_blocked()?.0;
//     if blocked_list.len() == 0 {
//         Ok(BooleanWrapper(false))
//     } else {
//         if blocked_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
//             Ok(BooleanWrapper(true))
//         } else {
//             Ok(BooleanWrapper(false))
//         }
//     }
// }

// HELPER FUNCTION
pub fn get_latest_contact_info(
    agent_pubkey: &AgentPubKey
) -> ExternResult<Option<Contact>> {
    let filter = QueryFilter::new()
    .entry_type(EntryType::App(AppEntryType::new(
        EntryDefIndex::from(0),
        ZomeId::from(0),
        EntryVisibility::Private,
    )))
    .include_entries(true)
    .header_type(HeaderType::Create);
    let query_result = query(filter)?;
    let maybe_latest_contact = query_result
        .0
        .into_iter()
        .filter_map(|e| {
            if let Ok(Some(contact)) = e.into_inner().1.to_app_option::<Contact>() {
                if &contact.agent_id == agent_pubkey {
                    return Some(contact)
                } else {
                    return None
                }
            } else {
                None
            }
        })
        .max_by_key(|c| c.created);
    Ok(maybe_latest_contact)
} 

pub(crate) fn get_agent_pubkey_from_username(
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
