use hdk::prelude::*;

use crate::utils::to_timestamp;
use super::helpers::check_latest_state;

use super::{
    AgentPubKeysWrapper,
    Contact,
    ContactType,
};

pub fn remove_contacts_handler(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    
    check_latest_state(&agent_ids, ContactType::Remove)?;

    let removed_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Remove,
    );
    create_entry(&removed_contact)?;
    Ok(agent_ids)
}