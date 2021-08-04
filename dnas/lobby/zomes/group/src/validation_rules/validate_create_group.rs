use hdk::prelude::*;

use crate::group::Group;

// TODO: implement unit test
pub fn validate_create_group_handler(data: ValidateData) -> ExternResult<ValidateCallbackResult> {
    //data = { element = { signed_header, entry } , validation_package <Option> }
    // 1- create is valid if creator pubkey matches the signature
    // 2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long
    // 3- group members cannot be empty and must at least include 2 pubkeys
    // 4- creator AgentPubKey is not included int he group members

    let entry_author_pub_key: AgentPubKey = data.element.header().author().clone();
    let entry: Option<Group> = data.element.entry().to_app_option()?.clone();

    if let Some(group) = entry {
        let group_creator_pub_key: AgentPubKey = group.get_group_creator();
        let group_name_length: usize = group.name.clone().len();
        let group_members_length: usize = group.get_group_members().len();

        if !group_creator_pub_key.eq(&entry_author_pub_key) {
            return Ok(ValidateCallbackResult::Invalid(
                "the group creator pubkey dosent match with the signature".into(),
            )); //validation(1)
        }

        if group_name_length < 1 || group_name_length > 50 {
            return Ok(ValidateCallbackResult::Invalid(
                "the group name must at least contain 1 character and maximun 50 characters".into(),
            )); //validation(2)
        }

        if group_members_length < 2 {
            return Ok(ValidateCallbackResult::Invalid(
                "groups cannot be created with less than 3 members".into(),
            )); //validation(3)
        }

        if group
            .get_group_members()
            .contains(&group_creator_pub_key.clone())
        {
            return Ok(ValidateCallbackResult::Invalid(
                "creator AgentPubKey cannot be included in the group members list".into(),
            )); //validation(4)
        }
    }

    Ok(ValidateCallbackResult::Valid)
}
