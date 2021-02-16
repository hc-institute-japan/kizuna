mod types;
use crate::types::*;
use hdk3::prelude::*;

#[hdk_extern]
fn retrieve_latest_data(_: ()) -> ExternResult<AggregatedLatestData> {
    let blocked_contacts: AgentPubKeys =
        call(None, "contacts".into(), "list_blocked".into(), None, &())?;

    let added_contacts: AgentPubKeys =
        call(None, "contacts".into(), "list_added".into(), None, &())?;

    let user_info: UsernameInfo =
        call(None, "username".into(), "get_my_username".into(), None, &())?;

    let aggregated_data: AggregatedLatestData = AggregatedLatestData {
        user_info,
        added_contacts: added_contacts.0,
        blocked_contacts: blocked_contacts.0,
    };

    Ok(aggregated_data)
}
