#![allow(unused_imports)]
#![allow(dead_code)]
use hdk3::prelude::{
    *,
    // element::ElementEntry,
};
use super::{
    ContactsInfo,
    // AgentIdWrapper,
    ContactsWrapper,
    BlockedWrapper,
    UsernameWrapper,
    BooleanWrapper,
    Profile,
};
use crate::{utils::to_timestamp};

// GENERAL: Probably better to commit the ContactsInfo entry at init callback.

pub(crate) fn add_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    // implement once username_address() is implemented
    // let contact_agent_pubkey = username_address(username.0.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let added_profile = Profile::new(username.0.clone());

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the address to be added is already existing and return right away if it does
            if let false = contacts_info.contacts.iter().any(|v| v == &username.0) {
                contacts_info.contacts.push(username.0.clone());
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                // debug!("Tatsuya Sato here. {:#?}", contacts_info)?;
                Ok(added_profile)
            } else {
                Ok(added_profile)
            }
        },
        _ => {
            let mut new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            new_contacts.contacts.push(username.0.clone());
            create_entry!(new_contacts.clone())?;
            Ok(added_profile)
        },
    }
}

pub(crate) fn remove_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    // implement once username_address() is implemented
    // let contact_agent_pubkey = username_address(username.0.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the address to be removed exist in the contacts
            if let true = contacts_info.contacts.iter().any(|v| v == &username.0) {
                contacts_info.contacts.retain(|v| v != &username.0);
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                // debug!("Tatsuya Sato here. {:#?}", contacts_info)?;
                let removed_profile = Profile::new(username.0);
                Ok(removed_profile)
            } else {
                return Err(HdkError::Wasm(WasmError::Zome(
                    "{\"code\": \"404\", \"message\": \"This address wasn't found in contacts\"}".to_owned()
                )))
            }
        },
        _ => {
            // is it better to commit and return an empty ContactsInfo?
            Err(HdkError::Wasm(WasmError::Zome(
                "{\"code\": \"404\", \"message\": \"This agent has no contacts yet\"}".to_owned()
            )))
        },
    }
}

pub(crate) fn block_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    // implement once username_address() is implemented
    // let contact_agent_pubkey = username_address(username.0.clone())?;

    // let agent_pubkey = agent_info!()?.agent_latest_pubkey;
    // if agent_pubkey == contact_agent_pubkey {
    //     return Err(HdkError::Wasm(WasmError::Zome(
    //         "{\"code\": \"302\", \"message\": \"Cannot block own agent pubkey\"}".to_owned()
    //     )))
    // }

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;
    let blocked_profile = Profile::new(username.0.clone());

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the contact is already in the blocked list
            if let false = contacts_info.blocked.iter().any(|v| v == &username.0) {
                contacts_info.blocked.push(username.0.clone());

                // check if the contact is in the list of and remove it
                if let true = contacts_info.contacts.iter().any(|v| v == &username.0) {
                    contacts_info.contacts.retain(|v| v != &username.0);
                }

                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                // debug!("Tatsuya Sato here. {:#?}", contacts_info)?;
                Ok(blocked_profile)
            } else { Ok(blocked_profile) }
        },
        _ => {
            let mut new_contacts = ContactsInfo::new(to_timestamp(sys_time!()?))?;
            new_contacts.blocked.push(username.0.clone());
            create_entry!(new_contacts.clone())?;
            Ok(blocked_profile)
        },
    }
}

pub(crate) fn unblock_contact(username: UsernameWrapper) -> ExternResult<Profile> {
    // implement once username_address() is implemented
    // let contact_agent_pubkey = username_address(username.0.clone())?;

    let maybe_contacts_info_elements_components = query_contact_info_elements()?;

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let mut contacts_info = contacts_info_elements_components.1;
            let signed_header_hash = contacts_info_elements_components.0.into_inner();

            // check if the contact is in the blocked list
            if let true = contacts_info.blocked.iter().any(|v| v == &username.0) {
                contacts_info.blocked.retain(|v| v != &username.0);
                update_entry!(signed_header_hash.1, contacts_info.clone())?;
                // debug!("Tatsuya Sato here. {:#?}", contacts_info)?;
                let unblocked_profile = Profile::new(username.0);
                Ok(unblocked_profile)
            } else {
                return Err(HdkError::Wasm(WasmError::Zome(
                    "{\"code\": \"404\", \"message\": \"The contact is not in the list of blocked contacts\"}".to_owned()
                )))
            }
        },
        _ => {
            // is it better to commit and return an empty ContactsInfo?
            Err(HdkError::Wasm(WasmError::Zome(
                "{\"code\": \"404\", \"message\": \"This agent has no contacts yet\"}".to_owned()
            )))
        },
    }
}

pub(crate) fn list_contacts() -> ExternResult<ContactsWrapper> {
    let maybe_contacts_info_elements_components = query_contact_info_elements()?;

    match maybe_contacts_info_elements_components {
        Some(contacts_info_elements_components) => {
            let contacts_info = contacts_info_elements_components.1;
            let contacts = ContactsWrapper(contacts_info.contacts);
            Ok(contacts)
        },
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
        },
        _ => {
            // TODO: change to Vec<AgentPubKey>
            let empty_blocked = BlockedWrapper(Vec::default());
            Ok(empty_blocked) 
        }
    }
}

// change arg to AgentIdWrapper
pub(crate) fn in_contacts(username: UsernameWrapper) -> ExternResult<BooleanWrapper> {
    let contacts_list = list_contacts()?.0;
    if contacts_list.len() == 0 {
        Ok(BooleanWrapper(false))
    } else {
        if contacts_list.iter().any(|pubkey| pubkey == &username.0) {
            Ok(BooleanWrapper(true))
        } else {
            Ok(BooleanWrapper(false))
        }
    }
}

// HELPER FUNCTION
// fn get_agent_pubkey_from_username(username: UsernameWrapper) -> ExternResult<AgentPubKey> {
//     let zome_info = zome_info!()?;
//     let my_agent_pubkey = agent_info!()?.agent_latest_pubkey;
//     let function_name = zome::FunctionName("get_agent_pubkey_from_username".to_owned());
//     debug!("Tatsuya Sato working until here1")?;
//     let payload: SerializedBytes = username.try_into()?;
//     debug!("Tatsuya Sato working until here2")?;
//     match call_remote!(my_agent_pubkey, zome_info.zome_name, function_name, None, payload)? {
//         ZomeCallResponse::Ok(output) => {
//             debug!("Tatsuya Sato debugging, {:#?}", output)?;
//             let sb = output.into_inner();
//             let maybe_agent_pubkey: AgentPubKey = sb.try_into()?;
//             Ok(maybe_agent_pubkey)
//         },
//         ZomeCallResponse::Unauthorized => {
//             Err(HdkError::Wasm(WasmError::Zome(
//                 "{\"code\": \"401\", \"message\": \"This agent has no proper authorization\"}".to_owned()
//             )))
//         },
//     }
// }

fn query_contact_info_elements() -> ExternResult<Option<(element::SignedHeaderHashed, ContactsInfo)>> {
    let filter = QueryFilter::new()
    .entry_type(EntryType::App(AppEntryType::new(
        EntryDefIndex::from(0),
        ZomeId::from(0),
        EntryVisibility::Private)))
    .include_entries(true); 
    let query_result = query!(filter)?;
    let filtered_elements: Vec<Element> = query_result.0
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
            let contacts_info_elements_components = filtered_elements[0].clone().into_inner();
            let maybe_contacts_info: Option<ContactsInfo> = contacts_info_elements_components.1.to_app_option()?;
            match maybe_contacts_info {
                Some(contacts_info) => {
                    Ok(Some((contacts_info_elements_components.0, contacts_info)))
                },
                _ => {
                    // This means that the ElementEntry was a variant other than Present
                    // TODO: edit Error
                    Err(HdkError::Wasm(WasmError::Zome(
                        "contacts info entry is either inaccessible or not existing.".to_owned()
                    )))
                }
            }
        },
    }
}