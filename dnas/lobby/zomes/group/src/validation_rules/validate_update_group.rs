use hdk::prelude::*;

use crate::group::group_helpers::get_group_latest_version;
use crate::{entries::group::GroupOutput, group::group_helpers::get_group_entry_from_element};

use crate::group::Group;

pub fn validate_update_group_handler(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
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
                    let prev_group_entry_version: GroupOutput = get_group_latest_version(group_id)?;
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
                        .eq(&prev_group_entry_version.latest_name.clone())
                        && updated_group_entry
                            .get_group_members()
                            .eq(&prev_group_entry_version.members)
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
