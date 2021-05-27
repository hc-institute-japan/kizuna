use hdk::prelude::*;
mod types;
use crate::types::*;

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    //AggregatedLatestData

    let batch_size: BatchSize = BatchSize(21);
    let mut agent_pub_keys: Vec<AgentPubKey> = Vec::new(); // agentPubKeys of members

    let blocked_contacts_call_response: ZomeCallResponse =
        call(None, "contacts".into(), "list_blocked".into(), None, &())?;
    let blocked_contacts: AgentPubKeys =
        call_response_handler(blocked_contacts_call_response)?.decode()?;

    let blocked_profiles_call_response: ZomeCallResponse = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &blocked_contacts,
    )?;
    let blocked_profiles: UsernameList =
        call_response_handler(blocked_profiles_call_response)?.decode()?;

    let added_contacts_call_response: ZomeCallResponse =
        call(None, "contacts".into(), "list_added".into(), None, &())?;
    let added_contacts: AgentPubKeys =
        call_response_handler(added_contacts_call_response)?.decode()?;

    let added_profiles_call_response: ZomeCallResponse = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &added_contacts,
    )?;
    let added_profiles: UsernameList =
        call_response_handler(added_profiles_call_response)?.decode()?;

    let user_info_call_response: ZomeCallResponse =
        call(None, "username".into(), "get_my_username".into(), None, &())?;
    let user_info: UsernameInfo = call_response_handler(user_info_call_response)?.decode()?;

    let groups_call_response: ZomeCallResponse =
        call(None, "group".into(), "get_all_my_groups".into(), None, &())?;
    let groups: MyGroupListWrapper = call_response_handler(groups_call_response)?.decode()?;

    for group in &groups.0 {
        agent_pub_keys.extend(group.members.iter().cloned());
        agent_pub_keys.push(group.creator.clone())
    }
    agent_pub_keys.sort_unstable();
    agent_pub_keys.dedup();

    let member_profiles_call_response: ZomeCallResponse = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &AgentPubKeys(agent_pub_keys),
    )?;
    let member_profiles: UsernameList =
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

    // let latest_p2p_messages_call_response: ZomeCallResponse = call(
    //     None,
    //     "p2pmessage".into(),
    //     "get_latest_messages".into(),
    //     None,
    //     &batch_size,
    // )?;
    // let latest_p2p_messages: P2PMessageHashTables =
    //     call_response_handler(latest_p2p_messages_call_response)?.decode()?;

    // let global_preference_call_response: ZomeCallResponse = call(
    //     None,
    //     "preference".into(),
    //     "get_preference".into(),
    //     None,
    //     &(),
    // )?;
    // let global_preference: Preference =
    //     call_response_handler(global_preference_call_response)?.decode()?;

    // let per_agent_preference_call_response: ZomeCallResponse = call(
    //     None,
    //     "preference".into(),
    //     "get_per_agent_preference".into(),
    //     None,
    //     &(),
    // )?;
    // let per_agent_preference: PerAgentPreference =
    //     call_response_handler(per_agent_preference_call_response)?.decode()?;

    // let per_group_preference_call_response: ZomeCallResponse = call(
    //     None,
    //     "preference".into(),
    //     "get_per_group_preference".into(),
    //     None,
    //     &(),
    // )?;
    // let per_group_preference: PerGroupPreference =
    //     call_response_handler(per_group_preference_call_response)?.decode()?;

    let aggregated_data: AggregatedLatestData = AggregatedLatestData {
        user_info,
        added_contacts: added_profiles.0,
        blocked_contacts: blocked_profiles.0,
        groups,
        latest_group_messages,
        member_profiles,
        // latest_p2p_messages,
        // global_preference,
        // per_agent_preference,
        // per_group_preference,
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
                String::from("Unauthorized Call to : ") + function_name.as_ref(),
            ));
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(WasmError::Guest(
                String::from("Network Error : ") + error.as_ref(),
            ));
        }
    }
}
