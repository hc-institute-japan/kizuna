use hdk::prelude::*;

use super::*;

pub(crate) fn fetch_preference() -> ExternResult<(SignedActionHashed, Preference)> {
    let filter: QueryFilter = filter_for(QueryTarget::Preference, true)?;
    let mut query_result = query(filter)?;
    query_result.reverse();

    if query_result.get(0).is_some() {
        //this unwrap is safe here, we check first the value on the condition above
        let record = query_result.get(0).unwrap();

        let record_entry: Option<Preference> = record.entry().to_app_option()?;
        let record_signed_action_hashed: SignedActionHashed = record.signed_action().to_owned();

        match record_entry {
            Some(preference_entry) => {
                return Ok((record_signed_action_hashed, preference_entry));
            }
            None => (),
        }
    }
    crate::error("no entry found for global preference")
}

fn create_preference(preference: Preference) -> ExternResult<Preference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::error("problems were encountered during creation of entry"),
    }
}

pub(crate) fn set_preference(preference_io: PreferenceIO) -> ExternResult<Preference> {
    match (preference_io.typing_indicator, preference_io.read_receipt) {
        (Some(typing_indicator), Some(read_receipt)) => create_preference(Preference {
            typing_indicator,
            read_receipt,
        }),
        _ => match fetch_preference() {
            Ok(fetched_preference) => {
                let typing_indicator = preference_io
                    .typing_indicator
                    .unwrap_or(fetched_preference.1.typing_indicator);
                let read_receipt = preference_io
                    .read_receipt
                    .unwrap_or(fetched_preference.1.read_receipt);
                let preference = Preference {
                    typing_indicator,
                    read_receipt,
                };

                match preference == fetched_preference.1 {
                    true => Ok(preference),
                    _ => create_preference(preference),
                }
            }
            _ => crate::error("no entry found for global preference"),
        },
    }
}

pub(crate) fn fetch_per_agent_preference() -> ExternResult<(SignedActionHashed, PerAgentPreference)>
{
    let filter: QueryFilter = filter_for(QueryTarget::AgentPreference, true)?;
    let mut query_result = query(filter)?;
    query_result.reverse();

    if query_result.get(0).is_some() {
        //this unwrap is safe here, we check first the value on the condition above
        let record = query_result.get(0).unwrap();

        let record_entry: Option<PerAgentPreference> = record.entry().to_app_option()?;
        let record_signed_action_hashed: SignedActionHashed = record.signed_action().to_owned();

        match record_entry {
            Some(per_agent_preference_entry) => {
                return Ok((record_signed_action_hashed, per_agent_preference_entry));
            }
            None => (),
        }
    }

    crate::error("no entry found for global preference.")
}

fn create_per_agent_preference(preference: PerAgentPreference) -> ExternResult<PerAgentPreference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::error("problems were encountered during creation of entry"),
    }
}

pub(crate) fn set_per_agent_preference(
    per_agent_preference: PerAgentPreferenceIO,
) -> ExternResult<PerAgentPreference> {
    match (
        per_agent_preference.clone().typing_indicator,
        per_agent_preference.clone().read_receipt,
    ) {
        (Some(typing_indicator), Some(read_receipt)) => {
            create_per_agent_preference(PerAgentPreference {
                typing_indicator,
                read_receipt,
            })
        }
        _ => match fetch_per_agent_preference() {
            Ok(fetched_preference) => {
                let preference = PerAgentPreference {
                    typing_indicator: per_agent_preference
                        .clone()
                        .typing_indicator
                        .unwrap_or(fetched_preference.1.typing_indicator.clone()),
                    read_receipt: per_agent_preference
                        .clone()
                        .read_receipt
                        .unwrap_or(fetched_preference.1.read_receipt.clone()),
                };

                match fetched_preference.1 == preference {
                    true => Ok(preference),
                    _ => create_per_agent_preference(preference),
                }
            }
            _ => crate::error("no entry found for per agent preference."),
        },
    }
}

pub(crate) fn fetch_per_group_preference() -> ExternResult<(SignedActionHashed, PerGroupPreference)>
{
    let filter: QueryFilter = filter_for(QueryTarget::GroupPreference, true)?;
    let mut query_result = query(filter)?;
    query_result.reverse();

    if query_result.get(0).is_some() {
        //this unwrap is safe here, we check first the value on the condition above
        let record = query_result.get(0).unwrap();

        let record_entry: Option<PerGroupPreference> = record.entry().to_app_option()?;
        let record_signed_action_hashed: SignedActionHashed = record.signed_action().to_owned();

        match record_entry {
            Some(per_group_preference_entry) => {
                return Ok((record_signed_action_hashed, per_group_preference_entry));
            }
            None => (),
        }
    }

    crate::error("no entry found for global preference.")
}

fn create_per_group_preference(preference: PerGroupPreference) -> ExternResult<PerGroupPreference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::error("problems were encountered during creation of entry"),
    }
}

pub(crate) fn set_per_group_preference(
    per_group_preference: PerGroupPreferenceIO,
) -> ExternResult<PerGroupPreference> {
    match (
        per_group_preference.clone().typing_indicator,
        per_group_preference.clone().read_receipt,
    ) {
        (Some(typing_indicator), Some(read_receipt)) => {
            create_per_group_preference(PerGroupPreference {
                typing_indicator,
                read_receipt,
            })
        }
        _ => match fetch_per_group_preference() {
            Ok(fetched_preference) => {
                let preference = PerGroupPreference {
                    typing_indicator: per_group_preference
                        .clone()
                        .typing_indicator
                        .unwrap_or(fetched_preference.1.typing_indicator.clone()),
                    read_receipt: match per_group_preference.clone().read_receipt {
                        Some(read_receipt) => read_receipt,
                        _ => fetched_preference.1.read_receipt.clone(),
                    },
                };

                match preference == fetched_preference.1 {
                    true => Ok(preference),
                    _ => create_per_group_preference(preference),
                }
            }
            _ => crate::error("no entry found for per group preference"),
        },
    }
}

//helper function
fn filter_for(query_target: QueryTarget, include_entries: bool) -> ExternResult<QueryFilter> {
    let entry_index: u8;

    match query_target {
        QueryTarget::Preference => entry_index = 0,
        QueryTarget::AgentPreference => entry_index = 1,
        QueryTarget::GroupPreference => entry_index = 2,
    }

    let query_filter: QueryFilter = QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(entry_index),
            zome_info()?.id,
            EntryVisibility::Private,
        )))
        .include_entries(include_entries);

    Ok(query_filter)
}
