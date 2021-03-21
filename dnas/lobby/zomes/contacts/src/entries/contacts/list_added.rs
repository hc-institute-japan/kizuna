use hdk::prelude::*;

use super::helpers::list_added_or_blocked;

use super::{  
    ContactType,
    AgentPubKeysWrapper,
};

pub fn list_added_handler() -> ExternResult<AgentPubKeysWrapper> {
    Ok(list_added_or_blocked(ContactType::Add)?)
}