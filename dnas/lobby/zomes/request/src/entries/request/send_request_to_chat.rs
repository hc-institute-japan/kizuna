use hdk::prelude::*;

use crate::utils::call_response_handler;

pub fn send_request_to_chat_handler(agent: AgentPubKey) -> ExternResult<HeaderHash> {
    
    let claim_call_response: ZomeCallResponse = call_remote(
        agent.clone(),
        zome_info()?.zome_name,
        "receive_request_to_chat".to_string().into(),
        None,
        agent_info()?.agent_latest_pubkey
    )?;

    let claim: CapClaim = call_response_handler(claim_call_response)?.decode()?;

    create_cap_claim(claim)
}
