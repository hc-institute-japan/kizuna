use hdk::prelude::*;

use super::group_helpers::get_group_latest_version;
use super::{Group, GroupOutput};
use crate::utils::error;

pub fn get_all_my_groups_handler() -> ExternResult<Vec<GroupOutput>> {
    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut my_linked_groups_entries: Vec<GroupOutput> = vec![];

    let links = get_links(my_pub_key.into(), Some(LinkTag::new("member")))?;

    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::latest()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get_details(get_input))?;

    let get_output_result: Vec<Details> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    for details in get_output_result {
        match details {
            Details::Entry(group_entry_details) => {
                if let Entry::App(group_entry_bytes) = group_entry_details.entry {
                    let group_sb: SerializedBytes = group_entry_bytes.into_sb();
                    let first_ver_group: Group = group_sb.try_into()?;
                    // get original value of created and creator here
                    let group_id = hash_entry(first_ver_group.clone())?;

                    let mut group = first_ver_group;

                    // This is the SignedHeaderHashed of the sole Create Header of Group
                    let group_signed_header_hashed: SignedHeaderHashed =
                        group_entry_details.headers[0].to_owned();

                    let group_revision_id = group_signed_header_hashed.header_address().to_owned(); // This is the create header hash of Group

                    if !group_entry_details.updates.is_empty() {
                        let latest_group: GroupOutput = get_group_latest_version(group_id.clone())?;

                        group.name = latest_group.latest_name; // latest group name
                        group.members = latest_group.members; // latest group members
                        group.avatar = latest_group.avatar;
                        group.session = latest_group.session;
                    }

                    my_linked_groups_entries.push(GroupOutput::new(
                        group.clone(),
                        group_id.clone(),
                        group_revision_id.clone(),
                    ));
                } else {
                    return error("this is a fatal error. Something is wrong with holochain [get all my groups].");
                }
            }
            _ => (),
        }
    }

    Ok(my_linked_groups_entries)
}
