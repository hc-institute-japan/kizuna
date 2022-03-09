use std::collections::{BTreeSet, HashMap};

use entries::group::validations::create_group;
use entries::group::validations::update_group;
use hdk::prelude::*;

mod entries;
mod signals;
mod utils;

use entries::group::{self, GroupOutput};
use entries::group_message;

use group::{
    add_members::add_members_handler, create_group::create_group_handler,
    get_all_my_groups::get_all_my_groups_handler, group_helpers,
    remove_members::remove_members_handler, update_group_avatar::update_group_avatar_handler,
    update_group_name::update_group_name_handler,
};

use group_message::{
    get_adjacent_group_messages::get_adjacent_group_messages_handler,
    get_files_bytes::get_files_bytes_handler,
    get_latest_messages_for_all_groups::get_latest_messages_for_all_groups_handler,
    get_messages_by_group_by_timestamp::get_messages_by_group_by_timestamp_handler,
    get_pinned_messages::get_pinned_messages_handler,
    get_previous_group_messages::get_previous_group_messages_handler,
    get_subsequent_group_messages::get_subsequent_group_messages_handler,
    indicate_group_typing::indicate_group_typing_handler, pin_message::pin_message_handler,
    post_commit::group_message_post_commit::group_message_post_commit,
    read_group_message::read_group_message_handler, send_message::send_message_handler,
    send_message_in_target_date::send_message_in_target_date_handler,
    unpin_message::unpin_message_handler,
};

use signals::{SignalDetails, SignalPayload};

use group_message::{
    GroupChatFilter, GroupFileBytes, GroupMessage, GroupMessageElement, GroupMessageInput,
    GroupMessageInputWithDate, GroupMessageReadData, GroupMessageWithId, GroupMessagesOutput,
    GroupMsgAdjacentFetchFilter, GroupMsgBatchFetchFilter, GroupTypingDetailData, PinDetail,
};

use group::{
    CreateGroupInput, CreateGroupOutput, Group, UpdateGroupAvatarIO, UpdateGroupNameIO,
    UpdateMembersIO,
};

entry_defs![
    Group::entry_def(),
    Path::entry_def(),
    GroupMessage::entry_def(),
    GroupFileBytes::entry_def(),
    PathEntry::entry_def()
];

// this is only exposed outside of WASM for testing purposes.
#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = BTreeSet::new();

    // TODO: name may be changed to better suit the context of cap grant.s
    let tag: String = "group_zome_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;
    let zome_name: ZomeName = zome_info()?.name;

    fuctions.insert((zome_name.clone(), FunctionName("recv_remote_signal".into())));

    let cap_grant_entry: CapGrantEntry = CapGrantEntry::new(
        tag,    // A string by which to later query for saved grants.
        access, // Unrestricted access means any external agent can call the extern
        fuctions,
    );

    create_cap_grant(cap_grant_entry)?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let signal_detail: SignalDetails = signal.decode()?;
    match signal_detail.payload {
        SignalPayload::AddedToGroup(_) => {
            emit_signal(&signal_detail)?;
        }
        SignalPayload::GroupTypingDetail(_) => {
            emit_signal(&signal_detail)?;
        }
        SignalPayload::GroupMessageRead(_) => {
            emit_signal(&signal_detail)?;
        }
        SignalPayload::GroupMessageData(_) => {
            emit_signal(&signal_detail)?;
        }
        SignalPayload::PinMessageData(_) => {
            emit_signal(&signal_detail)?;
        }
    }
    Ok(())
}

#[hdk_extern(infallible)]
fn post_commit(signed_headers: Vec<SignedHeaderHashed>) {
    let headers = signed_headers
        .into_iter()
        .map(|sh| sh.header().to_owned())
        .collect::<Vec<Header>>();
    for header in headers {
        match header {
            Header::Create(create) => match create.clone().entry_type {
                EntryType::App(app_entry_type) => match app_entry_type.id() {
                    // group message
                    EntryDefIndex(2) => group_message_post_commit(create).unwrap(),
                    _ => (),
                },
                _ => (),
            },
            _ => (),
        }
    }
}

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op {
        Op::StoreElement { element } => match element.header() {
            Header::Create(header) => match header.to_owned().entry_type {
                EntryType::App(app_entry_type) => {
                    let group_id = ZomeId::new(4);
                    if app_entry_type.zome_id == group_id {
                        return match app_entry_type.id {
                            EntryDefIndex(0) => create_group::store_group_element(
                                element.clone(),
                                header.to_owned(),
                            ),
                            _ => Ok(ValidateCallbackResult::Valid),
                        };
                    } else {
                        Ok(ValidateCallbackResult::Valid)
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            },
            Header::Update(header) => match header.to_owned().entry_type {
                EntryType::App(app_entry_type) => {
                    let group_id = ZomeId::new(4);
                    if app_entry_type.zome_id == group_id {
                        return match app_entry_type.id {
                            EntryDefIndex(0) => update_group::store_group_element(
                                element.clone(),
                                header.to_owned(),
                            ),
                            _ => Ok(ValidateCallbackResult::Invalid(
                                ("Updating this entry is invalid").to_string(),
                            )),
                        };
                    } else {
                        Ok(ValidateCallbackResult::Valid)
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            },
            Header::Delete(_) => Ok(ValidateCallbackResult::Invalid(
                "deleting entry isn't valid".to_string(),
            )),
            Header::DeleteLink(_) => Ok(ValidateCallbackResult::Invalid(
                "deleting link isn't valid".to_string(),
            )),
            _ => Ok(ValidateCallbackResult::Valid),
        },
        Op::StoreEntry { header, entry } => match header.hashed.into_content() {
            EntryCreationHeader::Create(create) => match create.clone().entry_type {
                EntryType::App(app_entry_type) => {
                    let group_id = ZomeId::new(4);
                    if app_entry_type.zome_id == group_id {
                        match app_entry_type.id {
                            EntryDefIndex(0) => {
                                create_group::store_group_entry(entry, create.to_owned())
                            }
                            _ => Ok(ValidateCallbackResult::Valid),
                        }
                    } else {
                        Ok(ValidateCallbackResult::Valid)
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            },
            EntryCreationHeader::Update(update) => match update.clone().entry_type {
                EntryType::App(app_entry_type) => {
                    let group_id = ZomeId::new(4);
                    if app_entry_type.zome_id == group_id {
                        match app_entry_type.id {
                            EntryDefIndex(0) => {
                                update_group::store_group_entry(entry, update.to_owned())
                            }
                            _ => Ok(ValidateCallbackResult::Invalid(
                                ("Updating this entry is invalid").to_string(),
                            )),
                        }
                    } else {
                        Ok(ValidateCallbackResult::Valid)
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            },
        },
        Op::RegisterCreateLink { .. } => Ok(ValidateCallbackResult::Valid),
        Op::RegisterUpdate {
            update,
            new_entry,
            original_entry: _,
            original_header: _,
        } => {
            let group_id = ZomeId::new(4);
            let updated_group_header: Update = update.hashed.into_content();
            if let EntryType::App(app_entry_type) = updated_group_header.entry_type.clone() {
                if app_entry_type.zome_id == group_id {
                    return update_group::register_group_update(updated_group_header, new_entry);
                }
            }
            Ok(ValidateCallbackResult::Valid)
        }
        Op::RegisterDeleteLink { create_link: _, .. } => Ok(ValidateCallbackResult::Invalid(
            "deleting links isn't valid".to_string(),
        )),
        Op::RegisterDelete { .. } => Ok(ValidateCallbackResult::Invalid(
            "deleting entries isn't valid".to_string(),
        )),
        Op::RegisterAgentActivity { header } => {
            // the old_entry’s header is not a Create (we update the same create entry )
            // author of Create Header doesn't match the author of the Update Header
            match header.header() {
                Header::Update(header) => {
                    let group_id = ZomeId::new(4);
                    if let EntryType::App(app_entry_type) = header.to_owned().entry_type.clone() {
                        if app_entry_type.zome_id == group_id {
                            return update_group::register_agetnt_activity(header.to_owned());
                        }
                    }
                    Ok(ValidateCallbackResult::Valid)
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
    }
}

// Group CRUD
#[hdk_extern]
fn create_group(create_group_input: CreateGroupInput) -> ExternResult<CreateGroupOutput> {
    return create_group_handler(create_group_input);
}

#[hdk_extern]
fn add_members(add_members_input: UpdateMembersIO) -> ExternResult<UpdateMembersIO> {
    return add_members_handler(add_members_input);
}

#[hdk_extern]
fn remove_members(remove_members_input: UpdateMembersIO) -> ExternResult<UpdateMembersIO> {
    return remove_members_handler(remove_members_input);
}

#[hdk_extern]
fn update_group_name(
    update_group_name_input: UpdateGroupNameIO,
) -> ExternResult<UpdateGroupNameIO> {
    return update_group_name_handler(update_group_name_input);
}

#[hdk_extern]
fn update_group_avatar(
    update_group_avatar_input: UpdateGroupAvatarIO,
) -> ExternResult<UpdateGroupAvatarIO> {
    return update_group_avatar_handler(update_group_avatar_input);
}

#[hdk_extern]
fn get_all_my_groups(_: ()) -> ExternResult<Vec<GroupOutput>> {
    return get_all_my_groups_handler();
}

#[hdk_extern]
fn get_group_latest_version(group_id: EntryHash) -> ExternResult<GroupOutput> {
    return group_helpers::get_group_latest_version(group_id);
}

// Group Message CRUD
#[hdk_extern]
fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageWithId> {
    return send_message_handler(message_input);
}

#[hdk_extern]
fn get_previous_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_previous_group_messages_handler(filter);
}

#[hdk_extern]
fn get_subsequent_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_subsequent_group_messages_handler(filter);
}

#[hdk_extern]
fn get_adjacent_group_messages(
    filter: GroupMsgAdjacentFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_adjacent_group_messages_handler(filter);
}

#[hdk_extern]
fn get_latest_messages_for_all_groups(batch_size: u8) -> ExternResult<GroupMessagesOutput> {
    return get_latest_messages_for_all_groups_handler(batch_size);
}

#[hdk_extern]
fn get_messages_by_group_by_timestamp(
    group_chat_filter: GroupChatFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_messages_by_group_by_timestamp_handler(group_chat_filter);
}

#[hdk_extern]
fn get_files_bytes(file_hashes: Vec<EntryHash>) -> ExternResult<HashMap<String, SerializedBytes>> {
    return get_files_bytes_handler(file_hashes);
}

#[hdk_extern]
fn pin_message(pin_detail: PinDetail) -> ExternResult<()> {
    return pin_message_handler(pin_detail);
}

#[hdk_extern]
fn unpin_message(pin_detail: PinDetail) -> ExternResult<()> {
    return unpin_message_handler(pin_detail);
}

#[hdk_extern]
fn get_pinned_messages(
    group_hash: EntryHash,
) -> ExternResult<HashMap<String, GroupMessageElement>> {
    return get_pinned_messages_handler(group_hash);
}

#[hdk_extern]
fn read_group_message(
    group_message_read_io: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    return read_group_message_handler(group_message_read_io);
}

#[hdk_extern]
fn indicate_group_typing(group_typing_detail_data: GroupTypingDetailData) -> ExternResult<()> {
    return indicate_group_typing_handler(group_typing_detail_data);
}

// #[hdk_extern]
// fn validate_create_entry_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
//     return validate_create_group_handler(data);
// }

// #[hdk_extern]
// fn validate_update_entry_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
//     return validate_update_group_handler(data);
// }

/*
These function are only used for testing purposes
should be uncommented on production use
*/
#[hdk_extern]
fn send_message_in_target_date(
    message_input: GroupMessageInputWithDate,
) -> ExternResult<GroupMessageWithId> {
    return send_message_in_target_date_handler(message_input);
}
