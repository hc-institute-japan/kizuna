use hdk::prelude::*;

use super::helpers::check_latest_state;

use super::{AgentPubKeysWrapper, Contact, ContactType};

pub fn unblock_contacts_handler(
    agent_ids: AgentPubKeysWrapper,
) -> ExternResult<AgentPubKeysWrapper> {
    check_latest_state(&agent_ids, ContactType::Unblock)?;
    let unblocked_contact = Contact::new(sys_time()?, agent_ids.0.clone(), ContactType::Unblock);
    create_entry(&unblocked_contact)?;
    Ok(agent_ids)
}
