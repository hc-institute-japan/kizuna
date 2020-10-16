use super::{CapFor, Claims};
use hdk3::prelude::*;

pub(crate) fn init(_: ()) -> ExternResult<InitCallbackResult> {
    debug!("-- [INIT] --\n")?;
    // grant unrestricted access to accept_cap_claim so other agents can send us claims
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "accept_cap_claim".into()));

    let mut x: GrantedFunctions = HashSet::new();
    x.insert((zome_info!()?.zome_name, "receive_request".into()));

    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions,
    })?;
    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions: x,
    })?;

    debug!("-- [END_INIT] --\n")?;
    Ok(InitCallbackResult::Pass)
}

pub(crate) fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    debug!("-- [GET_CAP_CLAIMS] --\n")?;

    let query_result = query!(QueryFilter::new().include_entries(true))?;

    let cap_vector: Vec<CapClaim> = query_result
        .0
        .into_iter()
        .filter_map(|el| {
            let entry: Result<Option<CapClaim>, SerializedBytesError> =
                el.into_inner().1.to_app_option();
            match entry {
                Ok(Some(cap_claim)) => Some(cap_claim),
                _ => None,
            }
        })
        .collect();
    debug!("-- [END GET_CAP_CLAIMS] --\n")?;
    Ok(Claims(cap_vector))
}

pub(crate) fn send_request(agent: AgentPubKey) -> ExternResult<()> {
    call_remote!(
        agent,
        zome_info!()?.zome_name,
        "receive_request".to_string().into(),
        None,
        agent_info!()?.agent_latest_pubkey.try_into()?
    )?;
    Ok(())
}

pub(crate) fn create_grant_entry(secret: CapSecret) -> ExternResult<CapGrantEntry> {
    let mut functions: GrantedFunctions = HashSet::new();
    let this_zome = zome_info!()?.zome_name;
    functions.insert((this_zome, "needs_cap_claim".into()));
    Ok(CapGrantEntry {
        tag: "".into(),
        access: secret.into(),
        functions,
    })
}

pub(crate) fn send_message(cap_for: CapFor) -> ExternResult<ZomeCallResponse> {
    let result: ZomeCallResponse = call_remote!(
        cap_for.1,
        zome_info!()?.zome_name,
        "needs_cap_claim".to_string().into(),
        Some(cap_for.0),
        ().try_into()?
    )?;
    Ok(result)
}

pub(crate) fn receive_request(agent: AgentPubKey) -> ExternResult<()> {
    let tag = String::from("has_cap_claim");
    debug!("-- [RECEIVE_REQUEST] --\n")?;

    debug!("\n\n\n\n\n")?;

    // make a new secret
    let secret = generate_cap_secret!()?;

    debug!("Secret: {:#?}", secret)?;
    // grant the secret as assigned (can only be used by the intended agent)
    let mut functions: GrantedFunctions = HashSet::new();
    let this_zome = zome_info!()?.zome_name;
    functions.insert((this_zome.clone(), "needs_cap_claim".into()));

    debug!("Functions: {:#?}", functions)?;

    create_cap_grant!(CapGrantEntry {
        access: (secret, agent.clone()).into(),
        functions,
        tag: tag.clone(),
    })?;

    debug!("\n\n\n\n\n")?;
    debug!("-- [END RECEIVE_REQUEST] --\n")?;

    match call_remote!(
        agent,
        this_zome,
        "xd".into(),
        None,
        CapClaim::new(tag, agent_info!()?.agent_latest_pubkey, secret).try_into()?
    )? {
        ZomeCallResponse::Ok(_) => {
            debug!("Inside ZomaCallResponse")?;
            Ok(())
        }
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Accept Request\"}".to_owned(),
        ))),
    }
}
