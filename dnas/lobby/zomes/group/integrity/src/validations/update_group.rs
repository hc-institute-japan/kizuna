use holochain_deterministic_integrity::prelude::*;

use group_integrity_types::Group;
use crate::utils::*;

// implement unit test
/**
 * validate the update of group entry; returning error if,
 * the old_entry’s action is not a Create (we update the same create entry )
 * author of Create Action doesn't match the author of the Update Action (only the creator of group can update)
 * members < 2
 * new name is empty || more than 50 characters
 * members field cannot include the creator's key
*/

pub fn store_group_record(
    record: Record,
    update: Update,
) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_record(record.clone())?;

    // This is the action address used to update this Group. May or may not be the correct action(create).
    Ok(validate_group_content(updated_group_entry, update.clone())?)
}

pub fn store_group_entry(entry: Entry, update: Update) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_entry(entry.clone())?;

    // This is the action address used to update this Group. May or may not be the correct action(create).
    Ok(validate_group_content(updated_group_entry, update.clone())?)
}

pub fn register_group_update(
    update: Update,
    new_entry: Entry,
) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_entry(new_entry)?;
    // This is the action address used to update this Group. May or may not be the correct action(create).
    Ok(validate_group_content(updated_group_entry, update)?)
}

pub fn register_agetnt_activity(update: Update) -> ExternResult<ValidateCallbackResult> {
    let group_revision_id = update.to_owned().original_action_address;
    let maybe_group_create_action = must_get_action(group_revision_id)?.action().to_owned();
    match maybe_group_create_action.action_type() {
        ActionType::Create => {
            if !maybe_group_create_action
                .author()
                .to_owned()
                .eq(&update.author)
            {
                return Ok(ValidateCallbackResult::Invalid(
                    "cannot update a group entry if you are not the group creator (admin)".into(),
                ));
            }
            Ok(ValidateCallbackResult::Valid)
        }
        _ => {
            return Ok(ValidateCallbackResult::Invalid(
                "you can only update the entry from the original Create group entry".into(),
            ));
        }
    }
}

fn validate_group_content(
    updated_group_entry: Group,
    update: Update,
) -> ExternResult<ValidateCallbackResult> {
    let maybe_group_create_action = must_get_action(update.original_action_address)?
        .action()
        .to_owned();
    match maybe_group_create_action.action_type() {
        ActionType::Create => {
            let updated_group_name_length: usize = updated_group_entry.name.clone().len();
            let updated_group_members_length: usize = updated_group_entry.get_group_members().len();
            let update_author = update.author;

            if !maybe_group_create_action
                .author()
                .to_owned()
                .eq(&update_author)
            {
                return Ok(ValidateCallbackResult::Invalid(
                    "cannot update a group entry if you are not the group creator (admin)".into(),
                ));
            }

            if updated_group_name_length < 1 || updated_group_name_length > 50 {
                return Ok(ValidateCallbackResult::Invalid(
                    "the group name must be 1 to 50 characters length".into(),
                ));
            }

            if updated_group_members_length < 2 {
                return Ok(ValidateCallbackResult::Invalid(
                    "groups cannot be created with less than 3 members".into(),
                ));
            }

            if updated_group_entry
                .get_group_members()
                .contains(&updated_group_entry.get_group_creator())
            {
                return Ok(ValidateCallbackResult::Invalid(
                    "creator AgentPubKey cannot be included in the group members list".into(),
                ));
            }
            Ok(ValidateCallbackResult::Valid)
        }
        _ => {
            return Ok(ValidateCallbackResult::Invalid(
                "you can only update the entry from the original Create group entry".into(),
            ));
        }
    }
}
