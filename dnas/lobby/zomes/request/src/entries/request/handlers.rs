use super::{CapFor, Payload, Claims};
use hdk3::prelude::*;

pub(crate) fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "receive_request_to_chat".into()));

    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions,
    })?;

    Ok(InitCallbackResult::Pass)
}

pub(crate) fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    let query_result = query!(
        QueryFilter::new()
        .entry_type(EntryType::CapClaim)
        .include_entries(true)
    )?;

    let result: Vec<CapClaim> = query_result
        .0
        .into_iter()
        .filter_map(|e| 
            match e.header() {
                Header::Create(_create) => Some(e.clone().into_inner().1.into_option().unwrap().as_cap_claim().unwrap().to_owned()),
                // TODO: handle updated and deleted CapClaims when the need arises.
                _ => None,
            })
        .collect();

    Ok(Claims(result))
}

pub(crate) fn try_cap_claim(cap_for: CapFor) -> ExternResult<Payload> {
    match call_remote!(
        cap_for.1,
        zome_info!()?.zome_name,
        "needs_cap_claim".to_string().into(),
        Some(cap_for.0),
        ().try_into()?
    )? {
        ZomeCallResponse::Ok(payload) => Ok(payload.into_inner().try_into()?),
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Accept Request\"}".to_owned(),
        )))
    }
}

pub(crate) fn send_request_to_chat(agent: AgentPubKey) -> ExternResult<HeaderHash> {
    match call_remote!(
        agent.clone(),
        zome_info!()?.zome_name,
        "receive_request_to_chat".to_string().into(),
        None,
        agent_info!()?.agent_latest_pubkey.try_into()?
    )? {
        ZomeCallResponse::Ok(payload) => {
            let claim: CapClaim = payload.into_inner().try_into()?;
            Ok(create_cap_claim!(claim)?)
        },
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Accept Request\"}".to_owned(),
        )))
    }
}

pub(crate) fn receive_request_to_chat(agent: AgentPubKey) -> ExternResult<CapClaim> {
    // TODO: check if the sender is in contacts.

    // tag can be improved probably
    let tag = String::from("has_cap_claim");
    let secret = generate_cap_secret!()?;
    let this_zome = zome_info!()?.zome_name;
    
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((this_zome.clone(), "needs_cap_claim".into()));

    create_cap_grant!(CapGrantEntry {
        access: (secret, agent.clone()).into(),
        functions,
        tag: tag.clone(),
    })?;

    // TOOD: must let the sender also create capclaim for the receiver to be able to send back message
    Ok(CapClaim::new(tag, agent_info!()?.agent_latest_pubkey, secret))
}
