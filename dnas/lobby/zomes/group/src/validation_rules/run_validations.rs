use hdk::prelude::*;

use super::validate_create_group::validate_create_group_handler;
use super::validate_update_group::validate_update_group_handler;
use super::ValidationInput;

pub fn run_validations_handler(
    validation_input: ValidationInput,
) -> ExternResult<ValidateCallbackResult> {
    let validation_type: String = validation_input.validation_type;
    let group_revision_id: HeaderHash = validation_input.group_revision_id;

    if let Some(element) = get(group_revision_id, GetOptions::latest())? {
        // if there is an element related to the received group revision id we should check what kind of validation we want to run for it

        let data: ValidateData = ValidateData {
            element: element,
            validation_package: None, // this can changed in the future but for now our validations are not using anythin from this field
        };
        match validation_type.as_str() {
            "create" => return validate_create_group_handler(data),
            "update" => return validate_update_group_handler(data),
            _ => (),
        }
    }

    return Ok(ValidateCallbackResult::Valid);
}
