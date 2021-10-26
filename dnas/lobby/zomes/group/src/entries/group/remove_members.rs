use hdk::prelude::*;

use super::{Group, GroupOutput, UpdateMembersIO};

use super::group_helpers::get_group_latest_version;
use crate::utils::error;

pub fn remove_members_handler(
    remove_members_input: UpdateMembersIO,
) -> ExternResult<UpdateMembersIO> {
    let members_to_remove: Vec<AgentPubKey> = remove_members_input.members.clone();
    let group_id: EntryHash = remove_members_input.group_id.clone();
    let group_revision_id: HeaderHash = remove_members_input.group_revision_id.clone();

    // check whether members field is empty
    if members_to_remove.is_empty() {
        return error("members field is empty");
    }

    // get most recent Group Entry
    let latest_group_version: GroupOutput = get_group_latest_version(group_id.clone())?;
    let mut group_members: Vec<AgentPubKey> = latest_group_version.members;

    // remove the members for the group members list
    group_members.retain(|member| !members_to_remove.contains(&member));

    // update_entry the Group with new members field using the  original HeaderHash
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let group_name: String = latest_group_version.latest_name;
    let created: Timestamp = sys_time()?;

    let updated_group: Group = Group::new(group_name, created, creator, group_members.clone());

    update_entry(group_revision_id, &updated_group)?;

    // // for all removed members we should delete the links between them and the group entry
    // for removed_member in members_to_remove {
    //     // get links for each removed member
    //     // TODO: see if looping through all links here is too much of an overload and change implementation if necessary.
    //     let groups_linked: Vec<Link> =
    //         get_links(removed_member.into(), Some(LinkTag::new("member")))?.into_inner();

    //     // filter all the groups linked to this agent to get the link between this group(group_id) and the agent(AgentPubKey)
    //     for link in groups_linked {
    //         if link.target.eq(&group_id) {
    //             // finally when we find the link we have to delete it -- delete_link(add_link_header: HeaderHash) -> HdkResult<HeaderHash>
    //             delete_link(link.create_link_hash)?;
    //         }
    //     }
    // }

    let get_links_input = members_to_remove
        .into_iter()
        .map(|member| GetLinksInput::new(member.into(), Some(LinkTag::new("member"))))
        .collect();

    let get_links_output = HDK
        .with(|h| h.borrow().get_links(get_links_input))?
        .into_iter()
        .map(|links| links.into_inner())
        .flatten()
        .collect::<Vec<Link>>();

    for link in get_links_output.into_iter() {
        if link.target.eq(&group_id) {
            delete_link(link.create_link_hash)?;
        }
    }

    Ok(remove_members_input)
}
