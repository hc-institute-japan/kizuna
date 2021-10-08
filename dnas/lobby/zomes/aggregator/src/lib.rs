use hdk::prelude::*;
mod types;
use crate::types::*;

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    let batch_size: u8 = 21;

    /* contacts */
    let mut agent_pub_keys: Vec<AgentPubKey> = Vec::new(); // agentPubKeys of members

    let blocked_contacts_call_response: ZomeCallResponse =
        call(None, "contacts".into(), "list_blocked".into(), None, &())?;
    let blocked_contacts: Vec<AgentPubKey> =
        call_response_handler(blocked_contacts_call_response)?.decode()?;

    let blocked_profiles_call_response: ZomeCallResponse = call(
        None,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &blocked_contacts,
    )?;
    let blocked_profiles: Vec<AgentProfile> =
        call_response_handler(blocked_profiles_call_response)?.decode()?;

    let added_contacts_call_response: ZomeCallResponse =
        call(None, "contacts".into(), "list_added".into(), None, &())?;
    let added_contacts: Vec<AgentPubKey> =
        call_response_handler(added_contacts_call_response)?.decode()?;

    let added_profiles_call_response: ZomeCallResponse = call(
        None,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &added_contacts,
    )?;
    let added_profiles: Vec<AgentProfile> =
        call_response_handler(added_profiles_call_response)?.decode()?;

    /* profiles */
    let user_info_call_response: ZomeCallResponse =
        call(None, "profiles".into(), "get_my_profile".into(), None, &())?;
    /*
    There is a strong assumption here that profile will not be
    variant None since it is assumed that the agent already made a profile before making this call
    from the frontend
    */
    let user_info: AgentProfile = call_response_handler(user_info_call_response)?
        .decode::<Option<AgentProfile>>()?
        .unwrap();

    /* group */
    let groups_call_response: ZomeCallResponse =
        call(None, "group".into(), "get_all_my_groups".into(), None, &())?;
    let groups: Vec<GroupOutput> = call_response_handler(groups_call_response)?.decode()?;

    for group in &groups {
        agent_pub_keys.extend(group.members.iter().cloned());
        agent_pub_keys.push(group.creator.clone())
    }
    agent_pub_keys.sort_unstable();
    agent_pub_keys.dedup();

    let member_profiles_call_response: ZomeCallResponse = call(
        None,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &agent_pub_keys,
    )?;
    let member_profiles: Vec<AgentProfile> =
        call_response_handler(member_profiles_call_response)?.decode()?;

    let latest_group_messages_call_response: ZomeCallResponse = call(
        None,
        "group".into(),
        "get_latest_messages_for_all_groups".into(),
        None,
        &batch_size,
    )?;
    let latest_group_messages: GroupMessagesOutput =
        call_response_handler(latest_group_messages_call_response)?.decode()?;

    /* p2pmessage */
    let latest_p2p_messages_call_response: ZomeCallResponse = call(
        None,
        "p2pmessage".into(),
        "get_latest_messages".into(),
        None,
        &batch_size,
    )?;
    let latest_p2p_messages: P2PMessageHashTables =
        call_response_handler(latest_p2p_messages_call_response)?.decode()?;

    /* preference */
    let global_preference_call_response: ZomeCallResponse = call(
        None,
        "preference".into(),
        "get_preference".into(),
        None,
        &(),
    )?;
    let global_preference: Preference =
        call_response_handler(global_preference_call_response)?.decode()?;

    let per_agent_preference_call_response: ZomeCallResponse = call(
        None,
        "preference".into(),
        "get_per_agent_preference".into(),
        None,
        &(),
    )?;
    let per_agent_preference: PerAgentPreference =
        call_response_handler(per_agent_preference_call_response)?.decode()?;

    let per_group_preference_call_response: ZomeCallResponse = call(
        None,
        "preference".into(),
        "get_per_group_preference".into(),
        None,
        &(),
    )?;
    let per_group_preference: PerGroupPreference =
        call_response_handler(per_group_preference_call_response)?.decode()?;

    let aggregated_data: AggregatedLatestData = AggregatedLatestData {
        user_info: AgentProfileCamel::from(user_info),
        added_contacts: convert_to_camel(added_profiles),
        blocked_contacts: convert_to_camel(blocked_profiles),
        groups,
        latest_group_messages,
        member_profiles: convert_to_camel(member_profiles),
        latest_p2p_messages,
        global_preference,
        per_agent_preference,
        per_group_preference,
    };

    Ok(aggregated_data)
}

fn call_response_handler(call_response: ZomeCallResponse) -> ExternResult<ExternIO> {
    match call_response {
        ZomeCallResponse::Ok(extern_io) => {
            return Ok(extern_io);
        }
        ZomeCallResponse::Unauthorized(_, _, function_name, _) => {
            return Err(WasmError::Guest(
                String::from("unauthorized all to : ") + function_name.as_ref(),
            ));
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(WasmError::Guest(
                String::from("network error : ") + error.as_ref(),
            ));
        }
        ZomeCallResponse::CountersigningSession(error) => {
            return Err(WasmError::Guest(
                String::from("countersigning error : ") + error.as_ref(),
            ));
        }
    }
}

fn convert_to_camel(agent_profiles: Vec<AgentProfile>) -> Vec<AgentProfileCamel> {
    agent_profiles
        .into_iter()
        .map(|p| AgentProfileCamel::from(p))
        .collect()
}
