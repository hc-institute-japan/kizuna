use hdk::prelude::*;

use super::list_blocked::list_blocked_handler;

use super::{
    AgentPubKey,
    BooleanWrapper,
};

pub fn in_blocked_handler(agent_pubkey: AgentPubKey) -> ExternResult<BooleanWrapper> {
    let blocked_list = list_blocked_handler()?.0;
    if blocked_list.len() == 0 {
        Ok(BooleanWrapper(false))
    } else {
        if blocked_list.iter().any(|pubkey| pubkey == &agent_pubkey) {
            Ok(BooleanWrapper(true))
        } else {
            Ok(BooleanWrapper(false))
        }
    }
}