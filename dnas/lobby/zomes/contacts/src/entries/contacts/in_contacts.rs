use hdk::prelude::*;

use super::list_added::list_added_handler;

use super::{
    AgentPubKey,
    BooleanWrapper,
};

pub fn in_contacts_handler(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    let contacts_list = list_added_handler()?.0;
    if contacts_list.len() == 0 {
        Ok(BooleanWrapper(false))
    } else {
        if contacts_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
            Ok(BooleanWrapper(true))
        } else {
            Ok(BooleanWrapper(false))
        }
    }
}