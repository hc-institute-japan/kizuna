use hdk::prelude::*;

use super::helpers::list_added_or_blocked;

use super::{AgentPubKeysWrapper, ContactType};

pub fn list_added_handler() -> ExternResult<AgentPubKeysWrapper> {
    Ok(list_added_or_blocked(ContactType::Add)?)
}
