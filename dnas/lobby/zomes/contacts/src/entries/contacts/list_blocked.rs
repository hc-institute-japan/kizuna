use hdk::prelude::*;

use super::helpers::list_added_or_blocked;

use super::{
    ContactType,
    AgentPubKeysWrapper,
};

pub fn list_blocked_handler() -> ExternResult<AgentPubKeysWrapper> {
    Ok(list_added_or_blocked(ContactType::Block)?)
}