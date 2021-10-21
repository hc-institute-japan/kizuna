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
 * members field cannot include the creator's keyØ
*/
pub fn validate_update_group_handler(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    let updated_group_entry: Group = try_from_element(data.element.clone())?;
    let updated_group_header: Header = data.element.header().clone();

    if let Header::Update(update_header) = data.element.header().clone() {
        // This is the header address used to update this Group. May or may not be the correct header(create).
        let group_revision_id: HeaderHash = update_header.original_header_address;

        let maybe_group_create_header = must_get_header(group_revision_id)?.header().to_owned();
        match maybe_group_create_header.header_type() {
            HeaderType::Create => {
                let updated_group_name_length: usize = updated_group_entry.name.clone().len();
                let updated_group_members_length: usize =
                    updated_group_entry.get_group_members().len();
                let update_author = updated_group_header.author();

                if !maybe_group_create_header
                    .author()
                    .to_owned()
                    .eq(update_author)
                {
                    return Ok(ValidateCallbackResult::Invalid(
                        "cannot update a group entry if you are not the group creator (admin)"
                            .into(),
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
            }
            _ => {
                return Ok(ValidateCallbackResult::Invalid(
                    "you can only update the entry from the original Create group entry".into(),
                ));
            }
        }
    }

    Ok(ValidateCallbackResult::Valid)
}
