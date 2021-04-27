use hdk::prelude::*;

use super::{Group, GroupOutput, UpdateMembersIO};

use crate::signals::SignalPayload;

use super::group_helpers::get_group_latest_version;
use super::group_helpers::link_and_emit_added_to_group_signals;
use crate::utils::error;
use crate::utils::get_my_blocked_list;
use crate::utils::to_timestamp;

pub fn add_members_handler(add_members_input: UpdateMembersIO) -> ExternResult<UpdateMembersIO> {
    let mut new_group_members_from_input: Vec<AgentPubKey> = add_members_input.members.clone();
    let group_id: EntryHash = add_members_input.group_id.clone();
    let group_revision_id: HeaderHash = add_members_input.group_revision_id.clone();

    // check whether members field is empty
    if new_group_members_from_input.is_empty() {
        return error("members field is empty");
    }

    // check if any invitees are blocked and return Err if so.
    let my_blocked_list: Vec<AgentPubKey> = get_my_blocked_list()?.0;

    for member in new_group_members_from_input.clone() {
        if my_blocked_list.contains(&member) {
            return error("cannot create group with blocked agents");
        }
    }

    // get most recent Group Entry
    let latest_group_version: Group = get_group_latest_version(group_id.clone())?;
    let mut group_members: Vec<AgentPubKey> = latest_group_version.get_group_members();
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;

    // filter the list of members the admin want to add to avoid duplicated members
    new_group_members_from_input.retain(|new_member| !group_members.contains(&new_member));

    // this var is needed because append method leave empty the vector received as arg
    let new_group_members: Vec<AgentPubKey> = new_group_members_from_input.clone();

    group_members.append(&mut new_group_members_from_input);

    let group_name: String = latest_group_version.name;
    let created: Timestamp = to_timestamp(sys_time()?);

    let updated_group: Group = Group::new(group_name, created, creator, group_members.clone());

    // update_entry the Group with new members field with original HeaderHash
    update_entry(group_revision_id.clone(), &updated_group)?;

    let group_output = GroupOutput {
        group_id: group_id.clone(),
        group_revision_id: group_revision_id,
        latest_name: updated_group.name.clone(),
        members: updated_group.members.clone(),
        creator: updated_group.creator.clone(),
        created: updated_group.created.clone(),
    };

    let signal_payload: SignalPayload = SignalPayload::AddedToGroup(group_output);

    // link all the new group members to the group entry with the link tag "member" and send them a signal with the group_id as payload
    link_and_emit_added_to_group_signals(
        new_group_members,
        group_id,
        LinkTag::new("member"),
        signal_payload,
    )?;

    Ok(add_members_input)
}
