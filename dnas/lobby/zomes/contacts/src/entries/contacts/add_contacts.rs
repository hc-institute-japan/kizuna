use hdk::prelude::*;

use crate::utils::to_timestamp;
use super::helpers::check_latest_state;

use super::{
    Contact,
    ContactType,
    AgentPubKeysWrapper,
};

pub fn add_contacts_handler(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    check_latest_state(&agent_ids, ContactType::Add)?;
    let added_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Add,
    );
    create_entry(&added_contact)?;
    Ok(agent_ids)
}