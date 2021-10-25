use hdk::prelude::*;

pub fn receive_request_to_chat_handler(agent: AgentPubKey) -> ExternResult<CapClaim> {
    // TODO: check if the sender is in contacts.

    // tag can be improved probably
    let tag = String::from("has_cap_claim");
    let secret = generate_cap_secret()?;
    let this_zome = zome_info()?.name;

    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((this_zome.clone(), "needs_cap_claim".into()));

    create_cap_grant(CapGrantEntry {
        access: (secret, agent.clone()).into(),
        functions,
        tag: tag.clone(),
    })?;

    // TOOD: must let the sender also create capclaim for the receiver to be able to send back message
    Ok(CapClaim::new(
        tag,
        agent_info()?.agent_latest_pubkey,
        secret,
    ))
}
