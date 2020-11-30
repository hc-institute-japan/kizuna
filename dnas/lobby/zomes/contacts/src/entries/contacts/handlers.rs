#![allow(unused_imports)]
#![allow(dead_code)]
use super::{
    BlockedWrapper,
    BooleanWrapper,
    ContactsInfo,
    ContactsWrapper,
    Profile,
    UsernameWrapper,
};
use crate::utils::to_timestamp;
use hdk3::prelude::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "in_blocked".into()));

    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions,
    })?;

    Ok(InitCallbackResult::Pass)
}

pub(crate) fn add_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let added_profile = Profile::new(agent_pubkey.clone(), username.0);
    match maybe_contacts_info_elements_components {
        // ContactsInfo already existing
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();
            // check if the address to be added is already existing and return right away if it does
            if let false = contacts_info
                .contacts
                .iter()
                .any(|v| v.to_owned() == agent_pubkey.clone())
            {
                contacts_info.contacts.push(agent_pubkey);
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                Ok(added_profile)
            } else {
                Ok(added_profile)
            }
        }
        _ => {
            // ContactsInfo not yet existing
            let mut new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            new_contacts.contacts.push(agent_pubkey);
            create_entry!(new_contacts.clone())?;
            Ok(added_profile)
        }
    }
}

pub(crate) fn remove_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let removed_profile = Profile::new(agent_pubkey.clone(), username.0);

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the address to be removed exist in the contacts
            if let true = contacts_info
                .contacts
                .iter()
                .any(|v| v == &agent_pubkey)
            {
                contacts_info
                    .contacts
                    .retain(|v| v != &agent_pubkey);
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                Ok(removed_profile)
            } else { return Ok(removed_profile) }
        }
        _ => {
            let new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            create_entry!(new_contacts.clone())?;
            Ok(removed_profile)
        }
    }
}

pub(crate) fn block_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let my_agent_pubkey = agent_info!()?.agent_latest_pubkey;
    if my_agent_pubkey == agent_pubkey { return Ok(Profile::default()) }

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let blocked_profile = Profile::new(agent_pubkey.clone(), username.0);
    debug!("Tatsuya Sato here. {:#?}", blocked_profile)?;
    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the contact is already in the blocked list
            if let false = contacts_info
                .blocked
                .iter()
                .any(|v| v == &agent_pubkey)
            {
                contacts_info.blocked.push(agent_pubkey.clone());

                // check if the contact is in the list of and remove it
                if let true = contacts_info
                    .contacts
                    .iter()
                    .any(|v| v == &agent_pubkey)
                {
                    contacts_info
                        .contacts
                        .retain(|v| v != &agent_pubkey);
                }

                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                Ok(blocked_profile)
            } else { Ok(blocked_profile) }
        }
        _ => {
            let mut new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            new_contacts.blocked.push(agent_pubkey);
            create_entry!(new_contacts.clone())?;
            Ok(blocked_profile)
        }
    }
}

pub(crate) fn unblock_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    let agent_pubkey = get_agent_pubkey_from_username(username.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let unblocked_profile = Profile::new(agent_pubkey.clone(), username.0);
    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the contact is in the blocked list
            if let true = contacts_info
                .blocked
                .iter()
                .any(|v| v == &agent_pubkey)
            {
                contacts_info.blocked.retain(|v| v != &agent_pubkey);
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                Ok(unblocked_profile)
            } else {
                return Ok(unblocked_profile)
            }
        }
        _ => {
            let new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            create_entry!(new_contacts.clone())?;
            Ok(unblocked_profile)
        }
    }
}

pub(crate) fn list_contacts() -> ExternResult<ContactsWrapper> {
    let maybe_contacts_info_elements_components = query_contact_info_elements()?;

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let contacts_info = contacts_info_elements_components.1;
            let contacts = ContactsWrapper(contacts_info.contacts);
            Ok(contacts)
        }
        _ => {
            // TODO: change to Vec<AgentPubKey>
            let empty_contacts = ContactsWrapper(Vec::default());
            Ok(empty_contacts)
        }
    }
}

pub(crate) fn list_blocked() -> ExternResult<BlockedWrapper> {
    let maybe_contacts_info_elements_components = query_contact_info_elements()?;

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let contacts_info = contacts_info_elements_components.1;
            let contacts = BlockedWrapper(contacts_info.blocked);
            Ok(contacts)
        }
        _ => {
            // TODO: change to Vec<AgentPubKey>
            let empty_blocked = BlockedWrapper(Vec::default());
            Ok(empty_blocked)
        }
    }
}

pub(crate) fn in_contacts(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    let contacts_list = list_contacts()?.0;
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
    debug!(format!("nicko entered in_blocked with argument {:?}", agent_pubkey.clone()))?;
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
fn query_contact_info_elements() -> ExternResult<Option<(element::SignedHeaderHashed, ContactsInfo)>>
{
    let filter = QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(0),
            ZomeId::from(0),
            EntryVisibility::Private,
        )))
        .include_entries(true);
    let query_result = query!(filter)?;
    let filtered_elements: Vec<Element> = query_result
        .0
        .into_iter()
        .filter_map(|e| {
            let header = e.header();
            match header {
                Header::Create(_create) => Some(e),
                Header::Update(_update) => Some(e),
                _ => None,
            }
        })
        .collect();
    match filtered_elements.len() {
        0 => Ok(None),
        _ => {
            // Is the index 0 enough to assure that we are getting the latest ContactsInfo entry from the source chain?
            let contacts_info_elements = filtered_elements.get(0);
            match contacts_info_elements {
                Some(el) => {
                    let contacts_info_elements_components = el.clone().into_inner();
                    let maybe_contacts_info: Option<ContactsInfo> = contacts_info_elements_components.1.to_app_option()?;
                    match maybe_contacts_info {
                        Some(contacts_info) => {
                            Ok(Some((contacts_info_elements_components.0, contacts_info)))
                        },
                        _ => {
                            // This means that the ElementEntry was a variant other than Present
                            // TODO: edit Error
                            crate::error("contacts info entry is either inaccessible or not existing.")
                        }
                    }
                },
                _ => {
                    Ok(None)
                }
            }
        }
    }
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
        username
    )?;
    Ok(agent_pubkey)
}