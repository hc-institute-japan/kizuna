use hdk::prelude::*;

use super::{CreateGroupInput, CreateGroupOutput, Group, GroupOutput};

use crate::signals::SignalPayload;

use super::group_helpers::link_and_emit_added_to_group_signals;
use crate::group_encryption::create_key::create_key_handler;
use crate::utils;
use crate::utils::error;

pub fn create_group_handler(
    create_group_input: CreateGroupInput,
) -> ExternResult<CreateGroupOutput> {
    let group_name: String = create_group_input.name;
    let group_members: Vec<AgentPubKey> = create_group_input.members;
    // let avatar = create_group_input.avatar;
    let created: Timestamp = sys_time()?;
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let session: u32 = 0;

    // get my blocked list from the contacs zome
    let my_blocked_list: Vec<AgentPubKey> = utils::get_my_blocked_list()?;

    // if even one member of the group is in my blocked list we have to return an error
    for member in group_members.clone() {
        if my_blocked_list.contains(&member) {
            return error("cannot create group with blocked agents")?;
        }
    }

    let group: Group = Group::new(
        group_name,
        created,
        creator.clone(),
        group_members.clone(),
        None,
        session.clone(),
    );

    // commit group entry
    let group_revision_id: HeaderHash = create_entry(&group.clone())?;
    let group_id: EntryHash = hash_entry(&group.clone())?;
    let group_output = GroupOutput {
        group_id: group_id.clone(),
        group_revision_id: group_revision_id.clone(),
        latest_name: group.name.clone(),
        members: group.members.clone(),
        creator: group.creator.clone(),
        created: group.created.clone(),
        avatar: group.avatar.clone(),
        session,
    };

    // link the group admin to the group
    create_link(creator.into(), group_id.clone(), LinkTag::new("member"))?;

    let signal_payload: SignalPayload = SignalPayload::AddedToGroup(group_output);
    /*
    link all the group members to the group entry with the link tag "member" and send
    them a signal with the group_id as payload.
    */
    link_and_emit_added_to_group_signals(
        group_members,
        group_id.clone(),
        LinkTag::new("member"),
        signal_payload,
    )?;

    create_key_handler(group_id.clone())?;

    Ok(CreateGroupOutput {
        content: group,
        group_id: group_id,
        group_revision_id: group_revision_id,
        session: 0,
    })
}
