use hdk::prelude::*;

mod entries;
mod signals;
mod utils;
mod validation_rules;

use entries::group::{self, GroupOutput};
use entries::group_message;

use group::{
    add_members::add_members_handler, create_group::create_group_handler,
    get_all_my_groups::get_all_my_groups_handler, group_helpers,
    remove_members::remove_members_handler, update_group_name::update_group_name_handler,
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
    read_group_message::read_group_message_handler, send_message::send_message_handler,
    send_message_in_target_date::send_message_in_target_date_handler,
    unpin_message::unpin_message_handler,
};

use validation_rules::run_validations::run_validations_handler;
use validation_rules::ValidationInput;

use signals::{SignalDetails, SignalPayload};

use group_message::{
    BatchSize, FileBytes, GroupChatFilter, GroupFileBytes, GroupHash, GroupMessage,
    GroupMessageInput, GroupMessageInputWithDate, GroupMessageReadData, GroupMessageWithId,
    GroupMessagesOutput, GroupMsgAdjacentFetchFilter, GroupMsgBatchFetchFilter,
    GroupTypingDetailData, PinContents, PinDetail,
};

use group::{
    CreateGroupInput, CreateGroupOutput, EntryHashWrapper, Group, MyGroupListWrapper,
    UpdateGroupNameIO, UpdateMembersIO,
};

entry_defs![
    Group::entry_def(),
    Path::entry_def(),
    GroupMessage::entry_def(),
    GroupFileBytes::entry_def()
];

// this is only exposed outside of WASM for testing purposes.
#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = HashSet::new();

    // TODO: name may be changed to better suit the context of cap grant.s
    let tag: String = "group_zome_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;
    let zome_name: ZomeName = zome_info()?.zome_name;

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
    }
    Ok(())
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
fn get_all_my_groups(_: ()) -> ExternResult<MyGroupListWrapper> {
    return get_all_my_groups_handler();
}

#[hdk_extern]
fn get_group_latest_version(group_id: EntryHashWrapper) -> ExternResult<GroupOutput> {
    return group_helpers::get_group_latest_version(group_id.group_hash);
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
fn get_latest_messages_for_all_groups(batch_size: BatchSize) -> ExternResult<GroupMessagesOutput> {
    return get_latest_messages_for_all_groups_handler(batch_size);
}

#[hdk_extern]
fn get_messages_by_group_by_timestamp(
    group_chat_filter: GroupChatFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_messages_by_group_by_timestamp_handler(group_chat_filter);
}

#[hdk_extern]
fn get_files_bytes(file_hashes: Vec<EntryHash>) -> ExternResult<FileBytes> {
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
fn get_pinned_messages(group_hash: GroupHash) -> ExternResult<PinContents> {
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

#[hdk_extern]
fn run_validation(validation_input: ValidationInput) -> ExternResult<ValidateCallbackResult> {
    return run_validations_handler(validation_input);
}
