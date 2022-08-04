use hdk::prelude::*;
mod types;
use crate::types::*;

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    /* contacts */
    let blocked_contacts_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "contacts".into(),
        "list_blocked".into(),
        None,
        &(),
    )?;
    let blocked_contacts_output: Vec<ContactOutput> =
        call_response_handler(blocked_contacts_call_response)?.decode()?;

    let blocked_contacts: Vec<AgentPubKey> =
        get_pk_from_contact_output(blocked_contacts_output.clone());

    let blocked_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &blocked_contacts,
    )?;

    let blocked_profiles: Vec<AgentProfile> =
        call_response_handler(blocked_profiles_call_response)?.decode()?;

    let added_contacts_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "contacts".into(),
        "list_added".into(),
        None,
        &(),
    )?;

    let added_contacts_output: Vec<ContactOutput> =
        call_response_handler(added_contacts_call_response)?.decode()?;

    let added_contacts: Vec<AgentPubKey> =
        get_pk_from_contact_output(added_contacts_output.clone());

    let added_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &added_contacts,
    )?;
    let added_profiles: Vec<AgentProfile> =
        call_response_handler(added_profiles_call_response)?.decode()?;

    /* profiles */
    let user_info_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles".into(),
        "get_my_profile".into(),
        None,
        &(),
    )?;

    let user_info =
        call_response_handler(user_info_call_response)?.decode::<Option<AgentProfile>>()?;

    /* group */
    let batch_size: u8 = 21;
    let mut group_member_keys: Vec<AgentPubKey> = Vec::new(); // agentPubKeys of members
    let groups_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "group".into(),
        "get_all_my_groups".into(),
        None,
        &(),
    )?;
    let groups: Vec<GroupOutput> = call_response_handler(groups_call_response)?.decode()?;

    for group in &groups {
        // let member_keys = agent_pub_key_to_b64(group.members.clone());
        let member_keys = group.members.clone();
        let creator_key: AgentPubKey = group.creator.clone().into();
        group_member_keys.extend(member_keys.iter().cloned());
        group_member_keys.push(creator_key);
    }
    group_member_keys.sort_unstable();
    group_member_keys.dedup();

    let member_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles".into(),
        "get_agents_profile".into(),
        None,
        &group_member_keys,
    )?;
    let member_profiles: Vec<AgentProfile> =
        call_response_handler(member_profiles_call_response)?.decode()?;

    let latest_group_messages_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "group".into(),
        "get_latest_messages_for_all_groups".into(),
        None,
        &batch_size,
    )?;
    let latest_group_messages: GroupMessagesOutput =
        call_response_handler(latest_group_messages_call_response)?.decode()?;

    /* p2pmessage */
    let latest_p2p_messages_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "p2pmessage".into(),
        "get_latest_messages".into(),
        None,
        &batch_size,
    )?;
    let latest_p2p_messages: P2PMessageHashTables =
        call_response_handler(latest_p2p_messages_call_response)?.decode()?;

    /* preference */
    let global_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference".into(),
        "get_preference".into(),
        None,
        &(),
    )?;
    let global_preference: Preference =
        call_response_handler(global_preference_call_response)?.decode()?;

    let per_agent_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference".into(),
        "get_per_agent_preference".into(),
        None,
        &(),
    )?;
    let per_agent_preference: PerAgentPreference =
        call_response_handler(per_agent_preference_call_response)?.decode()?;

    let per_group_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference".into(),
        "get_per_group_preference".into(),
        None,
        &(),
    )?;
    let per_group_preference: PerGroupPreference =
        call_response_handler(per_group_preference_call_response)?.decode()?;

    let aggregated_data: AggregatedLatestData = AggregatedLatestData {
        user_info,
        added_contacts: added_contacts_output,
        blocked_contacts: blocked_contacts_output,
        blocked_profiles,
        added_profiles,
        groups,
        latest_group_messages,
        member_profiles,
        latest_p2p_messages,
        global_preference,
        per_agent_preference,
        per_group_preference,
    };

    // debug!("Kizuna log: Current latest data {:?}", aggregated_data);

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

fn _agent_pub_key_to_b64(keys: Vec<AgentPubKey>) -> Vec<AgentPubKey> {
    keys.into_iter()
        .map(|key| {
            let b64: AgentPubKey = key.into();
            return b64;
        })
        .collect()
}

fn get_pk_from_contact_output(contacts: Vec<ContactOutput>) -> Vec<AgentPubKey> {
    contacts.into_iter().map(|contact| contact.id).collect()
}
