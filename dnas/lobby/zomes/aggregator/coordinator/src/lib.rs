use hdk::prelude::*;

use contacts_coordinator_types::hc_contacts_coordinator_types::ContactOutput;
use group_coordinator_types::{group::GroupOutput, group_message::GroupMessagesOutput};
use p2pmessage_coordinator_types::hc_p2pmessage_coordinator_types::P2PMessageHashTables;
use preference_integrity_types::{PerAgentPreference, PerGroupPreference, Preference};

// the aggregated data from other zomes
#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
#[serde(rename_all = "camelCase")]
struct AggregatedLatestData {
    pub user_info: Option<Record>,
    // for contacts
    pub added_contacts: Vec<ContactOutput>,
    pub blocked_contacts: Vec<ContactOutput>,
    pub added_profiles: Vec<Record>,
    pub blocked_profiles: Vec<Record>,
    // for group
    pub groups: Vec<GroupOutput>,
    pub latest_group_messages: GroupMessagesOutput,
    pub member_profiles: Vec<Record>,
    // for p2pmessage
    pub latest_p2p_messages: P2PMessageHashTables,
    // for preference
    pub global_preference: Preference,
    pub per_agent_preference: PerAgentPreference,
    pub per_group_preference: PerGroupPreference,
}

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    /* contacts */
    let blocked_contacts_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "contacts",
        "list_blocked".into(),
        None,
        &(),
    )?;
    let blocked_contacts_output: Vec<ContactOutput> =
        decoded_data_handler(call_response_handler(blocked_contacts_call_response)?.decode())?;

    let blocked_contacts: Vec<AgentPubKey> =
        get_pk_from_contact_output(blocked_contacts_output.clone());

    let blocked_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles",
        "get_agents_profile".into(),
        None,
        &blocked_contacts,
    )?;

    let blocked_profiles: Vec<Record> =
        decoded_data_handler(call_response_handler(blocked_profiles_call_response)?.decode())?;

    let added_contacts_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "contacts",
        "list_added".into(),
        None,
        &(),
    )?;

    let added_contacts_output: Vec<ContactOutput> =
        decoded_data_handler(call_response_handler(added_contacts_call_response)?.decode())?;

    let added_contacts: Vec<AgentPubKey> =
        get_pk_from_contact_output(added_contacts_output.clone());

    let added_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles",
        "get_agents_profile".into(),
        None,
        &added_contacts,
    )?;
    let added_profiles: Vec<Record> =
        decoded_data_handler(call_response_handler(added_profiles_call_response)?.decode())?;

    /* profiles */
    let user_info_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles",
        "get_my_profile".into(),
        None,
        &(),
    )?;

    let user_info = decoded_data_handler(
        call_response_handler(user_info_call_response)?.decode::<Option<Record>>(),
    )?;

    /* group */
    let batch_size: u8 = 21;
    let mut group_member_keys: Vec<AgentPubKey> = Vec::new(); // agentPubKeys of members
    let groups_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "group",
        "get_all_my_groups".into(),
        None,
        &(),
    )?;
    let groups: Vec<GroupOutput> =
        decoded_data_handler(call_response_handler(groups_call_response)?.decode())?;

    for group in &groups {
        let creator_key: AgentPubKey = group.creator.clone();
        group_member_keys.extend(group.members.clone().iter().cloned());
        group_member_keys.push(creator_key);
    }

    group_member_keys.sort_unstable();
    group_member_keys.dedup();

    let member_profiles_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "profiles",
        "get_agents_profile".into(),
        None,
        &group_member_keys,
    )?;
    let member_profiles: Vec<Record> =
        decoded_data_handler(call_response_handler(member_profiles_call_response)?.decode())?;

    let latest_group_messages_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "group",
        "get_latest_messages_for_all_groups".into(),
        None,
        &batch_size,
    )?;
    let latest_group_messages: GroupMessagesOutput =
        decoded_data_handler(call_response_handler(latest_group_messages_call_response)?.decode())?;

    /* p2pmessage */
    let latest_p2p_messages_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "p2pmessage",
        "get_latest_messages".into(),
        None,
        &batch_size,
    )?;
    let latest_p2p_messages: P2PMessageHashTables =
        decoded_data_handler(call_response_handler(latest_p2p_messages_call_response)?.decode())?;

    /* preference */
    let global_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference",
        "get_preference".into(),
        None,
        &(),
    )?;
    let global_preference: Preference =
        decoded_data_handler(call_response_handler(global_preference_call_response)?.decode())?;

    let per_agent_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference",
        "get_per_agent_preference".into(),
        None,
        &(),
    )?;
    let per_agent_preference: PerAgentPreference =
        decoded_data_handler(call_response_handler(per_agent_preference_call_response)?.decode())?;

    let per_group_preference_call_response: ZomeCallResponse = call(
        CallTargetCell::Local,
        "preference",
        "get_per_group_preference".into(),
        None,
        &(),
    )?;
    let per_group_preference: PerGroupPreference =
        decoded_data_handler(call_response_handler(per_group_preference_call_response)?.decode())?;

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
            return Err(wasm_error!(WasmErrorInner::Guest(String::from(
                String::from("unauthorized all to : ") + function_name.as_ref()
            ))))
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(wasm_error!(WasmErrorInner::Guest(String::from(
                String::from("network error : ") + error.as_ref()
            ))))
        }
        ZomeCallResponse::CountersigningSession(error) => {
            return Err(wasm_error!(WasmErrorInner::Guest(
                String::from("countersigning error : ") + error.as_ref()
            )))
        }
    }
}

fn decoded_data_handler<T>(res: Result<T, SerializedBytesError>) -> ExternResult<T> {
    match res {
        Ok(res_t) => return Ok(res_t),
        Err(e) => return Err(wasm_error!(WasmErrorInner::Guest(String::from(e)))),
    }
}

fn get_pk_from_contact_output(contacts: Vec<ContactOutput>) -> Vec<AgentPubKey> {
    contacts.into_iter().map(|contact| contact.id).collect()
}
