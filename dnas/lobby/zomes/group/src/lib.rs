use group::handlers;
use hdk3::prelude::*;

mod entries;
mod signals;
mod utils;

use entries::{group, group_message};

use signals::{SignalDetails, SignalPayload};

use group_message::{
    GroupChatFilter, GroupMessage, GroupMessageData, GroupMessageDataWrapper, GroupMessageInput,
    GroupMessageInputWithDate, GroupMessageReadData, GroupMessagesOutput, GroupMsgBatchFetchFilter,
    GroupTypingDetailData,
};

use entries::group::{
    handlers::get_group_entry_from_element,
    CreateGroupInput,
    CreateGroupOutput,
    EntryHashWrapper,
    // TYPES USED IN CREATE GROUP:
    Group,
    // TYPES USED IN GET ALL MY GROUPS
    MyGroupListWrapper,
    // TYPES USED IN UPDATE GROUP NAME
    UpdateGroupNameIO,
    // TYPES USED IN ADD MEMEBERS AND REMOVE MEMBERS:
    UpdateMembersIO,
    // TYPES USED IN VALIDATION FUNCTIONS
    ValidationInput,
};

entry_defs![
    Group::entry_def(),
    Path::entry_def(),
    GroupMessage::entry_def()
];

// this is only exposed outside of WASM for testing purposes.
#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = HashSet::new();

    // TODO: name may be changed to better suit the context of cap grant.s
    let tag: String = "create_group_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;

    let zome_name: ZomeName = zome_info()?.zome_name;
    let function_name: FunctionName = FunctionName("recv_remote_signal".into());

    fuctions.insert((zome_name, function_name));

    let cap_grant_entry: CapGrantEntry = CapGrantEntry::new(
        tag,    // A string by which to later query for saved grants.
        access, // Unrestricted access means any external agent can call the extern
        fuctions,
    );

    create_cap_grant(cap_grant_entry)?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    // currently only emitting the received signal
    // TODO: actually work with the received signal
    emit_signal(&signal)?;
    let signal_detail: SignalDetails = signal.clone().try_into()?;
    match signal_detail.payload {
        SignalPayload::AddedToGroup(_) => {
            // currently only emitting the received signal
            // TODO: actually work with the received signal
            emit_signal(&signal)?;
        }
        SignalPayload::GroupTypingDetail(_) => {
            emit_signal(&signal)?;
        }
        SignalPayload::GroupMessageRead(_) => {
            emit_signal(&signal)?;
        }
        SignalPayload::GroupMessageData(_) => {
            emit_signal(&signal)?;
        }
    }
    Ok(())
}

// VALIDATION RULES
// this is only exposed outside of WASM for testing purposes.
#[hdk_extern]
fn run_validation(validation_input: ValidationInput) -> ExternResult<ValidateCallbackResult> {
    let validation_type: String = validation_input.validation_type;
    let group_revision_id: HeaderHash = validation_input.group_revision_id;

    if let Some(element) = get(group_revision_id, GetOptions::latest())? {
        // if there is an element related to the received group revision id we should check what kind of validation we want to run for it

        let data: ValidateData = ValidateData {
            element: element,
            validation_package: None, // this can changed in the future but for now our validations are not using anythin from this field
        };
        match validation_type.as_str() {
            "create" => return validate_create_group(data),
            "update" => return validate_update_group(data),
            _ => (),
        }
    }

    return Ok(ValidateCallbackResult::Valid);
}

fn validate_create_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    //data = { element = { signed_header, entry } , validation_package <Option> }
    // 1- create is valid if creator pubkey matches the signature
    // 2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long
    // 3- group members cannot be empty and must at least include 2 pubkeys
    // 4- creator AgentPubKey is not included int he group members

    let entry_author_pub_key: AgentPubKey = data.element.header().author().clone();
    let entry: Option<Group> = data.element.entry().to_app_option()?.clone();

    if let Some(group) = entry {
        let group_creator_pub_key: AgentPubKey = group.get_group_creator();
        let group_name_length: usize = group.name.clone().len();
        let group_members_length: usize = group.get_group_members().len();

        if !group_creator_pub_key.eq(&entry_author_pub_key) {
            return Ok(ValidateCallbackResult::Invalid(
                "the group creator pubkey dosent match with the signature".into(),
            )); //validation(1)
        }

        if group_name_length < 1 || group_name_length > 50 {
            return Ok(ValidateCallbackResult::Invalid(
                "the group name must at least contain 1 character and maximun 50 characters".into(),
            )); //validation(2)
        }

        if group_members_length < 2 {
            return Ok(ValidateCallbackResult::Invalid(
                "groups cannot be created with less than 3 members".into(),
            )); //validation(3)
        }

        if group
            .get_group_members()
            .contains(&group_creator_pub_key.clone())
        {
            return Ok(ValidateCallbackResult::Invalid(
                "creator AgentPubKey cannot be included in the group members list".into(),
            )); //validation(4)
        }
    }

    Ok(ValidateCallbackResult::Valid)
}

fn validate_update_group(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    //data = { element = { signed_header, entry } , validation_package <Option> }

    // 1 update is only valid if the old_entry’s header is Create
    // 2 update is valid if author of Create Header matches the author of the Update Header -> so that only admin can update
    // 3 update is only valid if old_group_name != new_group_name | old_members != new_members
    // 4 update is valid only if members > 2 && new name is not empty or more than 50 characters

    let updated_group_entry: Group = get_group_entry_from_element(data.element.clone())?;
    let updated_group_header: Header = data.element.header().clone();

    if let Header::Update(update_header) = data.element.header().clone() {
        // This is the header address used to update this Group. May or may not be the correct header.
        let group_revision_id: HeaderHash = update_header.original_header_address;
        // This may or may not be the EntryHash of the first version of the Group Entry.
        let group_id: EntryHash = update_header.original_entry_address;

        if let Some(original_group_element) = get(group_revision_id, GetOptions::content())? {
            let maybe_group_create_header: Header = original_group_element.header().to_owned();

            match maybe_group_create_header.header_type() {
                HeaderType::Create => {
                    // THIS PREV GROUP ENTRY VERSION SHOULD CONTAIN THE PREV VERSION TO THIS ENTRY,
                    // BECAUSE WHEN THE VALIDATIONS ARE RUNNING THE HEADER UPDATE HISTORY DOSENT HAVE THIS UPDATE ON IT YET
                    let prev_group_entry_version: Group =
                        group::handlers::get_group_latest_version(group_id)?;
                    let updated_group_name_length: usize = updated_group_entry.name.clone().len();
                    let updated_group_members_length: usize =
                        updated_group_entry.get_group_members().len();

                    if !maybe_group_create_header
                        .author()
                        .to_owned()
                        .eq(updated_group_header.author())
                    {
                        return Ok(ValidateCallbackResult::Invalid(
                            "cannot update a group entry if you are not the group creator (admin)"
                                .into(),
                        )); //validation(2)
                    }

                    if updated_group_entry
                        .name
                        .eq(&prev_group_entry_version.name.clone())
                        && updated_group_entry
                            .get_group_members()
                            .eq(&prev_group_entry_version.get_group_members())
                    {
                        return Ok(ValidateCallbackResult::Invalid(
                            "nothing have been updated since the last commited group version"
                                .into(),
                        )); //validation(3)
                    }

                    if updated_group_name_length < 1 || updated_group_name_length > 50 {
                        return Ok(ValidateCallbackResult::Invalid(
                            "the group name must be 1 to 50 characters length".into(),
                        )); //validation(4.1)
                    }

                    if updated_group_members_length < 2 {
                        return Ok(ValidateCallbackResult::Invalid(
                            "groups cannot be created with less than 3 members".into(),
                        )); //validation(4.2)
                    }
                }
                _ => {
                    return Ok(ValidateCallbackResult::Invalid(
                        "you are trying to update an entry using a header whos type is not Create"
                            .into(),
                    )); // validation (1)
                }
            }
        }
    }

    Ok(ValidateCallbackResult::Valid)
}

//GROUP ZOME FUNCTIONS
#[hdk_extern]
fn create_group(create_group_input: CreateGroupInput) -> ExternResult<CreateGroupOutput> {
    group::handlers::create_group(create_group_input)
}

#[hdk_extern]
fn add_members(add_members_input: UpdateMembersIO) -> HdkResult<UpdateMembersIO> {
    group::handlers::add_members(add_members_input)
}

#[hdk_extern]
fn remove_members(remove_members_input: UpdateMembersIO) -> ExternResult<UpdateMembersIO> {
    group::handlers::remove_members(remove_members_input)
}

#[hdk_extern]
fn update_group_name(
    update_group_name_input: UpdateGroupNameIO,
) -> ExternResult<UpdateGroupNameIO> {
    group::handlers::update_group_name(update_group_name_input)
}

#[hdk_extern]
fn get_all_my_groups(_: ()) -> HdkResult<MyGroupListWrapper> {
    group::handlers::get_all_my_groups()
}

#[hdk_extern]
fn get_group_latest_version(group_id: EntryHashWrapper) -> ExternResult<Group> {
    group::handlers::get_group_latest_version(group_id.group_hash)
}

#[hdk_extern]
fn get_all_messages(group_id: EntryHash) -> ExternResult<GroupMessageDataWrapper> {
    group_message::handlers::get_all_messages(group_id)
}

#[hdk_extern]
fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
    group_message::handlers::send_message(message_input)
}

#[hdk_extern]
fn indicate_group_typing(group_typing_detail_data: GroupTypingDetailData) -> ExternResult<()> {
    group_message::handlers::indicate_group_typing(group_typing_detail_data)
}

#[hdk_extern]
fn read_group_message(
    group_message_read_io: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    group_message::handlers::read_group_message(group_message_read_io)
}

#[hdk_extern]
fn get_next_batch_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    group_message::handlers::get_next_batch_group_messages(filter)
}

//END LIST OF DEPENDENCIES ADDED FOR MANUEL

#[hdk_extern]
fn send_message_in_target_date(
    message_input: GroupMessageInputWithDate,
) -> ExternResult<GroupMessageData> {
    group_message::handlers::send_message_in_target_date(message_input)
}
#[hdk_extern]
fn get_messages_by_group_by_timestamp(
    group_chat_filter: GroupChatFilter,
) -> ExternResult<GroupMessagesOutput> {
    group_message::handlers::get_messages_by_group_by_timestamp(group_chat_filter)
}
