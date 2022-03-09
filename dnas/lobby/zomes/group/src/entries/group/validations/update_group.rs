use hdk::prelude::*;

use crate::group::Group;
use crate::utils::*;

// implement unit test
/**
 * validate the update of group entry; returning error if,
 * the old_entry’s header is not a Create (we update the same create entry )
 * author of Create Header doesn't match the author of the Update Header (only the creator of group can update)
 * members < 2
 * new name is empty || more than 50 characters
 * members field cannot include the creator's key
*/

pub fn store_group_element(
    element: Element,
    update: Update,
) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_element(element.clone())?;

    // This is the header address used to update this Group. May or may not be the correct header(create).
    Ok(validate_group_content(updated_group_entry, update.clone())?)
}

pub fn store_group_entry(entry: Entry, update: Update) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_entry(entry.clone())?;

    // This is the header address used to update this Group. May or may not be the correct header(create).
    Ok(validate_group_content(updated_group_entry, update.clone())?)
}

pub fn register_group_update(
    update: SignedHashed<Update>,
    new_entry: Entry,
) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_entry(new_entry)?;
    let updated_group_header: Update = update.hashed.into_content();
    // This is the header address used to update this Group. May or may not be the correct header(create).
    Ok(validate_group_content(
        updated_group_entry,
        updated_group_header.clone(),
    )?)
}

pub fn register_agetnt_activity(update: Update) -> ExternResult<ValidateCallbackResult> {
    let group_revision_id = update.to_owned().original_header_address;
    let maybe_group_create_header = must_get_header(group_revision_id)?.header().to_owned();
    match maybe_group_create_header.header_type() {
        HeaderType::Create => {
            if !maybe_group_create_header
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
    let maybe_group_create_header = must_get_header(update.original_header_address)?
        .header()
        .to_owned();
    match maybe_group_create_header.header_type() {
        HeaderType::Create => {
            let updated_group_name_length: usize = updated_group_entry.name.clone().len();
            let updated_group_members_length: usize = updated_group_entry.get_group_members().len();
            let update_author = update.author;

            if !maybe_group_create_header
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
