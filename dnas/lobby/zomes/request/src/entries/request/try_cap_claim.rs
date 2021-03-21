use hdk::prelude::*;

use crate::utils::call_response_handler;

use super::{
    CapFor,
    Payload,
};

pub fn try_cap_claim_handler(cap_for: CapFor) -> ExternResult<Payload> {

    let payload_call_reponse: ZomeCallResponse = call_remote(
        cap_for.1,
        zome_info()?.zome_name,
        "needs_cap_claim".to_string().into(),
        Some(cap_for.0),
        ().try_into()?
    )?;
    
    let payload: Payload = call_response_handler(payload_call_reponse)?.decode()?; 
    Ok(payload)
}