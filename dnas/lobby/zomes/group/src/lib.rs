use hdk::prelude::*;

mod entries;
mod signals;
mod utils;
mod validation_rules;

use entries::group;
use entries::group_message;

use group::add_members::add_members_handler;
use group::create_group::create_group_handler;
use group::get_all_my_groups::get_all_my_groups_handler;
use group::group_helpers;
use group::remove_members::remove_members_handler;
use group::update_group_name::update_group_name_handler;

use group_message::get_all_messages::get_all_messages_handler;
use group_message::get_latest_messages_for_all_groups::get_latest_messages_for_all_groups_handler;
use group_message::get_messages_by_group_by_timestamp::get_messages_by_group_by_timestamp_handler;
use group_message::get_next_batch_group_messages::get_next_batch_group_messages_handler;
use group_message::indicate_group_typing::indicate_group_typing_handler;
use group_message::read_group_message::read_group_message_handler;
use group_message::send_message::send_message_handler;
use group_message::send_message_in_target_date::send_message_in_target_date_handler;

use validation_rules::run_validations::run_validations_handler;
use validation_rules::ValidationInput;

use signals::{SignalDetails, SignalPayload};

use group_message::{
    BatchSize, GroupChatFilter, GroupFileBytes, GroupMessage, GroupMessageData,
    GroupMessageDataWrapper, GroupMessageInput, GroupMessageInputWithDate, GroupMessageReadData,
    GroupMessagesOutput, GroupMsgBatchFetchFilter, GroupTypingDetailData,
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

    fuctions.insert((zome_name.clone(), FunctionName("recv_remote_signal".into()) ));

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
    // currently only emitting the received signal
    // TODO: actually work with the received signal

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

//this is only exposed outside of WASM for testing purposes.
#[hdk_extern]
fn run_validation(validation_input: ValidationInput) -> ExternResult<ValidateCallbackResult> {
    return run_validations_handler(validation_input);
}

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
fn get_group_latest_version(group_id: EntryHashWrapper) -> ExternResult<Group> {
    return group_helpers::get_group_latest_version(group_id.group_hash);
}

//no tested methods

#[hdk_extern]
fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
    return send_message_handler(message_input);
}

#[hdk_extern]
fn get_all_messages(group_id: EntryHash) -> ExternResult<GroupMessageDataWrapper> {
    return get_all_messages_handler(group_id);
}

#[hdk_extern]
fn get_next_batch_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_next_batch_group_messages_handler(filter);
}

#[hdk_extern]
fn get_latest_messages_for_all_groups(batch_size: BatchSize) -> ExternResult<GroupMessagesOutput> {
    return get_latest_messages_for_all_groups_handler(batch_size);
}

#[hdk_extern]
fn indicate_group_typing(group_typing_detail_data: GroupTypingDetailData) -> ExternResult<()> {
    return indicate_group_typing_handler(group_typing_detail_data);
}

#[hdk_extern]
fn get_messages_by_group_by_timestamp(
    group_chat_filter: GroupChatFilter,
) -> ExternResult<GroupMessagesOutput> {
    return get_messages_by_group_by_timestamp_handler(group_chat_filter);
}

#[hdk_extern]
fn read_group_message(
    group_message_read_io: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    return read_group_message_handler(group_message_read_io);
}

// This function is only used for testing purposes
// should be uncommented on production use
#[hdk_extern]
fn send_message_in_target_date(
    message_input: GroupMessageInputWithDate,
) -> ExternResult<GroupMessageData> {
    return send_message_in_target_date_handler(message_input);
}
