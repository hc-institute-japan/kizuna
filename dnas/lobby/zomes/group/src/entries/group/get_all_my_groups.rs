use hdk::prelude::*;

use super::group_helpers::get_group_latest_version;
use super::{
    Group, 
    GroupOutput,
    MyGroupListWrapper,
};
use crate::utils::error;

pub fn get_all_my_groups_handler() -> ExternResult<MyGroupListWrapper> {
    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut my_linked_groups_entries: Vec<GroupOutput> = vec![];
    let mut group_id: EntryHash;
    let mut group_revision_id: HeaderHash;
    let mut group: Group;

    for link in get_links(my_pub_key.into(), Some(LinkTag::new("member")))?.into_inner() {
        if let Some(details) = get_details(link.target.clone(), GetOptions::latest())? {
            match details {
                Details::Entry(group_entry_details) => {
                    // This is the SignedHeaderHashed of the sole Create Header of Group
                    let group_signed_header_hashed: SignedHeaderHashed =
                        group_entry_details.headers[0].to_owned();

                    group_id = link.target.clone();
                    group_revision_id = group_signed_header_hashed.header_address().to_owned(); // This is the create header hash of Group

                    if let Entry::App(group_entry_bytes) = group_entry_details.entry {
                        let group_sb: SerializedBytes = group_entry_bytes.into_sb();
                        let first_ver_group: Group = group_sb.try_into()?;
                        // get original value of created and creator here
                        group = first_ver_group;
                    } else {
                        return error("this is a fatal error. Something is wrong with holochain.");
                    }

                    if !group_entry_details.updates.is_empty() {
                        let latest_group: Group = get_group_latest_version(link.target.clone())?;

                        group.name = latest_group.name; // latest group name

                        group.members = latest_group.members; // latest group members
                    }

                    my_linked_groups_entries.push(GroupOutput::new(
                        group,
                        group_id,
                        group_revision_id,
                    ));
                }
                _ => (),
            }
        }
    }

    let output: MyGroupListWrapper = MyGroupListWrapper(my_linked_groups_entries);

    Ok(output)
}