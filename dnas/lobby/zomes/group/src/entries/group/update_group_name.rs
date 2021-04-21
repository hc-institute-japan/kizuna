use hdk::prelude::*;

use super::group_helpers::get_group_latest_version;
use super::{Group, GroupOutput, UpdateGroupNameIO};
use crate::utils::error;
use crate::utils::to_timestamp;

pub fn update_group_name_handler(
    update_group_name_input: UpdateGroupNameIO,
) -> ExternResult<UpdateGroupNameIO> {
    let new_group_name: String = update_group_name_input.name.clone();
    let group_revision_id: HeaderHash = update_group_name_input.group_revision_id.clone();
    let group_id: EntryHash = update_group_name_input.group_id.clone();

    // 1 - we've to get the latest group entry version for the recived entryhash (group_id)
    let latest_group_version: GroupOutput = get_group_latest_version(group_id.clone())?;

    // 2 - check whether the new name is the same with old name and return error if so
    let old_group_name: String = latest_group_version.latest_name.clone();
    if new_group_name.eq(&old_group_name) {
        return error("the new name and old name of the group are the same.");
    }

    let created: Timestamp = to_timestamp(sys_time()?);
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let members: Vec<AgentPubKey> = latest_group_version.members;

    let updated_group: Group = Group::new(new_group_name, created, creator, members);

    // we always update the entry from the root_group_header_hash, the header hash for this entry is provided as arg (group_revision_id)
    // 3 - update_entry the Group with new name field using original HeaderHash
    update_entry(group_revision_id, &updated_group)?;

    Ok(update_group_name_input)
}
