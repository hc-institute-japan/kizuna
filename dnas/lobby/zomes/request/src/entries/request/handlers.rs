use super::CapFor;
use hdk3::prelude::*;

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
    debug!("Checking agent pub key... {:#?}", agent)?;

    // make a new secret
    let secret = generate_cap_secret!()?;
    debug!("Making a secret... {:#?}", secret)?;
    // grant the secret as assigned (can only be used by the intended agent)
    let mut functions: GrantedFunctions = HashSet::new();

    let this_zome = zome_info!()?.zome_name;
    debug!("Checking zome... {:#?}", this_zome)?;
    functions.insert((this_zome.clone(), "needs_cap_claim".into()));
    debug!("Checking granted functions... {:#?}", functions)?;
    debug!("Creating a grant... ")?;
    create_cap_grant!(CapGrantEntry {
        access: (secret, agent.clone()).into(),
        functions,
        tag: tag.clone(),
    })?;
    debug!("Grant created... ")?;

    // send the assigned cap token
    debug!("Ending receive_request...")?;
    match call_remote!(
        agent,
        this_zome,
        "accept_cap_claim".into(),
        None,
        CapClaim::new(tag, agent_info!()?.agent_latest_pubkey, secret,).try_into()?
    )? {
        ZomeCallResponse::Ok(_) => Ok(()),
        ZomeCallResponse::Unauthorized => Err(HdkError::Wasm(WasmError::Zome(
            "{\"code\": \"000\", \"message\": \"[Unauthorized] Accept Request\"}".to_owned(),
        ))),
    }
}
