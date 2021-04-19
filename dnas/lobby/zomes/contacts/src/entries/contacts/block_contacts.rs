use hdk::prelude::*;

use crate::utils::error;
use crate::utils::to_timestamp;
use super::helpers::check_latest_state;

use super::{
    AgentPubKeysWrapper,
    Contact,
    ContactType,
};

pub fn block_contacts_handler(agent_ids: AgentPubKeysWrapper) -> ExternResult<AgentPubKeysWrapper> {
    
    let me = agent_info()?.agent_latest_pubkey;
    // return err right away if trying to block oneself
    if let true = agent_ids.0.contains(&me) {
        return error("cannot block yourself");
    }

    check_latest_state(&agent_ids, ContactType::Block)?;
    let blocked_contact = Contact::new(
        to_timestamp(sys_time()?),
        agent_ids.0.clone(),
        ContactType::Block,
    );
    create_entry(&blocked_contact)?;
    Ok(agent_ids)
}