mod types;
use crate::types::*;
use hdk3::prelude::*;

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    let blocked_contacts: AgentPubKeys =
        call(None, "contacts".into(), "list_blocked".into(), None, &())?;

    let added_contacts: AgentPubKeys =
        call(None, "contacts".into(), "list_added".into(), None, &())?;

    let added_profiles: UsernameList = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &added_contacts,
    )?;

    let blocked_profiles: UsernameList = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &blocked_contacts,
    )?;

    let user_info: UsernameInfo =
        call(None, "username".into(), "get_my_username".into(), None, &())?;

    let groups: MyGroupListWrapper =
        call(None, "group".into(), "get_all_my_groups".into(), None, &())?;

    // agentPubKeys of members
    let mut agent_pub_keys: Vec<AgentPubKey> = Vec::new();

    for group in &groups.0 {
        agent_pub_keys.extend(group.members.iter().cloned());
        agent_pub_keys.push(group.creator.clone())
    }

    agent_pub_keys.sort_unstable();
    agent_pub_keys.dedup();

    let member_profiles: UsernameList = call(
        None,
        "username".into(),
        "get_usernames".into(),
        None,
        &AgentPubKeys(agent_pub_keys),
    )?;

    let batch_size: BatchSize = BatchSize(10);

    let latest_group_messages: GroupMessagesOutput = call(
        None,
        "group".into(),
        "get_latest_messages_for_all_groups".into(),
        None,
        &batch_size,
    )?;

    let latest_p2p_messages: P2PMessageHashTables = call(
        None,
        "p2pmessage".into(),
        "get_latest_messages".into(),
        None,
        &batch_size,
    )?;

    let global_preference: Preference = call(
        None,
        "preference".into(),
        "get_preference".into(),
        None,
        &(),
    )?;

    let per_agent_preference: PerAgentPreference = call(
        None,
        "preference".into(),
        "get_per_agent_preference".into(),
        None,
        &(),
    )?;

    let per_group_preference: PerGroupPreference = call(
        None,
        "preference".into(),
        "get_per_group_preference".into(),
        None,
        &(),
    )?;

    let aggregated_data: AggregatedLatestData = AggregatedLatestData {
        user_info,
        added_contacts: added_profiles.0,
        blocked_contacts: blocked_profiles.0,
        groups,
        latest_group_messages,
        member_profiles,
        latest_p2p_messages,
        global_preference,
        per_agent_preference,
        per_group_preference,
    };

    Ok(aggregated_data)
}
