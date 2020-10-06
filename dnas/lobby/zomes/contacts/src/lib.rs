#![allow(unused_imports)]
#![allow(dead_code)]
use hdk3::prelude::{
    // element::ElementEntry,
    EntryDef,
    *,
};
use entries::contacts;
use contacts::{ContactsInfo, Profile, UsernameWrapper, BlockedWrapper, ContactsWrapper, BooleanWrapper};


mod entries;
mod utils;

entry_defs![ ContactsInfo::entry_def() ];

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
fn list_contacts(_: ()) -> ExternResult<ContactsWrapper> {
    Ok(contacts::handlers::list_contacts()?)
}

#[hdk_extern]
fn list_blocked(_: ()) -> ExternResult<BlockedWrapper> {
    Ok(contacts::handlers::list_blocked()?)
}

#[hdk_extern]
fn in_contacts(username: UsernameWrapper) -> ExternResult<BooleanWrapper> {
    Ok(contacts::handlers::in_contacts(username)?)
}

// #[hdk_extern]
// fn get_agent_pubkey_from_username(username: UsernameWrapper) -> ExternResult<AgentPubKey> {
//     Ok(contacts::handlers::get_agent_pubkey_from_username(username)?)
// }

// #[hdk_extern]
// fn test_query(_: ()) -> ExternResult<Element> {
//     let filter = QueryFilter::new();
//     let with_entry_filter = filter.include_entries(true);
//     let entry_filter = with_entry_filter.entry_type(EntryType::App(AppEntryType::new(EntryDefIndex::from(0), ZomeId::from(0), EntryVisibility::Private)));
//     let query_result = query!(entry_filter)?;
//     let filtered_header: Vec<Element> = query_result.0
//     .into_iter()
//     .filter_map(|e| {
//         let header = e.header();
//         match header {
//             Header::Create(_create) => Some(e),
//             Header::Update(_update) => Some(e),
//             _ => None,
//         }
//     })
//     .collect();
//     let element_vec = ElementVec(filtered_header);
//     debug!("Tatsuya Sato testing query, {:#?}", element_vec)?;
//     Ok(element_vec.0[0].clone())
// }
