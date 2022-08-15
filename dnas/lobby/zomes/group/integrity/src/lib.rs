use group_integrity_types::{Group, GroupFileBytes, GroupMessage};
use holochain_deterministic_integrity::prelude::*;

pub mod utils;
pub mod validations;
// use validations::{create_group, update_group};

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    #[entry_def(name = "group", visibility = "public")]
    Group(Group),
    #[entry_def(name = "group_message", visibility = "public")]
    GroupMessage(GroupMessage),
    #[entry_def(name = "group_file_bytes", visibility = "public")]
    GroupFileBytes(GroupFileBytes),
}

#[hdk_link_types]
pub enum LinkTypes {
    GroupHashTimestampPath,      // 3
    TimestampPathToGroupMessage, // 4
    GroupToGroupMessage,         // 5
    AgentToGroup,                // 6
    GroupMessageToAgent,         // 7
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
    //     match op {
    //         Op::StoreRecord { record } => match record.action() {
    //             Action::Create(action) => match action.to_owned().entry_type {
    //                 EntryType::App(app_entry_type) => {
    //                     // let group_id = ZomeId::new(4);
    //                     // if app_entry_type.zome_id == group_id {
    //                     return match app_entry_type.id {
    //                         EntryDefIndex(0) => create_group::store_group_record(record.clone()),
    //                         _ => Ok(ValidateCallbackResult::Valid),
    //                     };
    //                     // } else {
    //                     //     Ok(ValidateCallbackResult::Valid)
    //                     // }
    //                 }
    //                 _ => Ok(ValidateCallbackResult::Valid),
    //             },
    //             Action::Update(action) => match action.to_owned().entry_type {
    //                 EntryType::App(app_entry_type) => {
    //                     // let group_id = ZomeId::new(4);
    //                     // if app_entry_type.zome_id == group_id {
    //                     return match app_entry_type.id {
    //                         EntryDefIndex(0) => {
    //                             update_group::store_group_record(record.clone(), action.to_owned())
    //                         }
    //                         _ => Ok(ValidateCallbackResult::Invalid(
    //                             ("Updating this entry is invalid").to_string(),
    //                         )),
    //                     };
    //                     // } else {
    //                     //     Ok(ValidateCallbackResult::Valid)
    //                     // }
    //                 }
    //                 _ => Ok(ValidateCallbackResult::Valid),
    //             },
    //             Action::Delete(_) => Ok(ValidateCallbackResult::Valid), // NOTE: We need an entry type for Delete Action as well so that we can run per zome validations
    //             Action::DeleteLink(_) => Ok(ValidateCallbackResult::Valid), // NOTE: We at least need the zome ID in the action.
    //             _ => Ok(ValidateCallbackResult::Valid),
    //         },
    //         Op::StoreEntry { action, entry } => match action.hashed.into_content() {
    //             EntryCreationAction::Create(create) => match create.clone().entry_type {
    //                 EntryType::App(app_entry_type) => {
    //                     // let group_id = ZomeId::new(4);
    //                     // if app_entry_type.zome_id == group_id {
    //                     match app_entry_type.id {
    //                         EntryDefIndex(0) => {
    //                             create_group::store_group_entry(entry, create.to_owned())
    //                         }
    //                         _ => Ok(ValidateCallbackResult::Valid),
    //                     }
    //                     // } else {
    //                     //     Ok(ValidateCallbackResult::Valid)
    //                     // }
    //                 }
    //                 _ => Ok(ValidateCallbackResult::Valid),
    //             },
    //             EntryCreationAction::Update(update) => match update.clone().entry_type {
    //                 EntryType::App(app_entry_type) => {
    //                     // let group_id = ZomeId::new(4);
    //                     // if app_entry_type.zome_id == group_id {
    //                     match app_entry_type.id {
    //                         EntryDefIndex(0) => {
    //                             update_group::store_group_entry(entry, update.to_owned())
    //                         }
    //                         _ => Ok(ValidateCallbackResult::Invalid(
    //                             ("Updating this entry is invalid").to_string(),
    //                         )),
    //                     }
    //                     // } else {
    //                     //     Ok(ValidateCallbackResult::Valid)
    //                     // }
    //                 }
    //                 _ => Ok(ValidateCallbackResult::Valid),
    //             },
    //         },
    //         Op::RegisterCreateLink { .. } => Ok(ValidateCallbackResult::Valid),
    //         Op::RegisterUpdate {
    //             update,
    //             new_entry,
    //             original_entry: _,
    //             original_action: _,
    //         } => {
    //             // let group_id = ZomeId::new(4);
    //             let updated_group_action: Update = update.hashed.into_content();
    //             if let EntryType::App(_app_entry_type) = updated_group_action.entry_type.clone() {
    //                 // if app_entry_type.zome_id == group_id {
    //                 return update_group::register_group_update(updated_group_action, new_entry);
    //                 // }
    //             }
    //             Ok(ValidateCallbackResult::Valid)
    //         }
    //         Op::RegisterDeleteLink { create_link: _, .. } => Ok(ValidateCallbackResult::Valid), // this can be expanded to only make deleting of links invalid in group zome since CreateLink is available.
    //         Op::RegisterDelete { .. } => Ok(ValidateCallbackResult::Valid),
    //         Op::RegisterAgentActivity { action } => {
    //             // the old_entry’s action is not a Create (we update the same create entry )
    //             // author of Create Action doesn't match the author of the Update Action
    //             match action.action() {
    //                 Action::Update(action) => {
    //                     // let group_id = ZomeId::new(4);
    //                     if let EntryType::App(_app_entry_type) = action.to_owned().entry_type.clone() {
    //                         // if app_entry_type.zome_id == group_id {
    //                         return update_group::register_agetnt_activity(action.to_owned());
    //                         // }
    //                     }
    //                     Ok(ValidateCallbackResult::Valid)
    //                 }
    //                 _ => Ok(ValidateCallbackResult::Valid),
    //             }
    //         }
    //     }
}
