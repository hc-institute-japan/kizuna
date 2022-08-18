#[allow(dead_code)]
use crate::utils::{try_from_entry, try_from_record};
use group_integrity_types::Group;
use holochain_deterministic_integrity::prelude::*;

// TODO: implement unit test
/**
 * validate creation of group entry. returning error if,
 *
 * creator pubkey does not match the signature
 * group name is more than 50 characters
 * group name is less than one character long
 * group members field is < 2 pubkeys
 * group creator AgentPubKey is included in the group members
*/

pub fn store_group_record(record: Record) -> ExternResult<ValidateCallbackResult> {
    let entry_author_pub_key: AgentPubKey = record.action().author().clone();
    let entry: Group = try_from_record(record)?;
    return Ok(validate_group_content(entry, entry_author_pub_key)?);
}

pub fn store_group_entry(entry: Entry, action: Create) -> ExternResult<ValidateCallbackResult> {
    let entry_author_pub_key: AgentPubKey = action.author.clone();
    let group: Group = try_from_entry(entry)?;
    Ok(validate_group_content(group, entry_author_pub_key)?)
}

fn validate_group_content(
    group: Group,
    entry_author_pub_key: AgentPubKey,
) -> ExternResult<ValidateCallbackResult> {
    let group_creator_pub_key: AgentPubKey = group.get_group_creator();
    let group_name_length: usize = group.name.clone().len();
    let group_members_length: usize = group.get_group_members().len();

    if !group_creator_pub_key.eq(&entry_author_pub_key) {
        return Ok(ValidateCallbackResult::Invalid(
            "the group creator pubkey dosent match with the action signature".into(),
        ));
    }

    if group_name_length < 1 || group_name_length > 50 {
        return Ok(ValidateCallbackResult::Invalid(
            "the group name must at least contain 1 character and maximun 50 characters".into(),
        ));
    }

    if group_members_length < 2 {
        return Ok(ValidateCallbackResult::Invalid(
            "groups cannot be created with less than 3 members".into(),
        ));
    }

    if group
        .get_group_members()
        .contains(&group_creator_pub_key.clone())
    {
        return Ok(ValidateCallbackResult::Invalid(
            "creator AgentPubKey cannot be included in the group members list".into(),
        ));
    }
    Ok(ValidateCallbackResult::Valid)
}
