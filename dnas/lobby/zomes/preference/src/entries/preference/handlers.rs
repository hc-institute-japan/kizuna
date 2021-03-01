use hdk3::prelude::*;

use super::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    create_entry(&Preference {
        typing_indicator: true,
        read_receipt: true,
    })?;

    create_entry(&PerAgentPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new(),
    })?;

    create_entry(&PerGroupPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new(),
    })?;

    Ok(InitCallbackResult::Pass)
}

fn fetch_preference() -> ExternResult<(element::SignedHeaderHashed, Preference)> {
    let query_result = query(
        QueryFilter::new()
            .entry_type(EntryType::App(AppEntryType::new(
                EntryDefIndex::from(0),
                zome_info()?.zome_id,
                EntryVisibility::Private,
            )))
            .include_entries(true),
    )?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<Preference> = element.1.to_app_option()?;
            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::err("104", "No entry found for global preference."),
            }
        }
        None => crate::err("104", "No entry found for global preference."),
    }
}

pub(crate) fn get_preference() -> ExternResult<Preference> {
    Ok(Preference {
        ..fetch_preference()?.1
    })
}

fn create_preference(preference: Preference) -> ExternResult<Preference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::err("100", "Problems were encountered during creation of entry"),
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
            _ => crate::err("104", "No entry found for global preference."),
        },
    }
}

fn fetch_per_agent_preference() -> ExternResult<(element::SignedHeaderHashed, PerAgentPreference)> {
    let query_result = query(
        QueryFilter::new()
            .entry_type(EntryType::App(AppEntryType::new(
                EntryDefIndex::from(1),
                zome_info()?.zome_id,
                EntryVisibility::Private,
            )))
            .include_entries(true),
    )?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<PerAgentPreference> = element.1.to_app_option()?;
            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::err("104", "No entry found for per agent preference."),
            }
        }
        None => crate::err("104", "No entry found for per agent preference."),
    }
}

pub(crate) fn get_per_agent_preference() -> ExternResult<PerAgentPreference> {
    Ok(PerAgentPreference {
        ..fetch_per_agent_preference()?.1
    })
}

fn create_per_agent_preference(preference: PerAgentPreference) -> ExternResult<PerAgentPreference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::err("100", "Problems were encountered during creation of entry"),
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
            _ => crate::err("104", "No entry found for per agent preference."),
        },
    }
}

fn fetch_per_group_preference() -> ExternResult<(element::SignedHeaderHashed, PerGroupPreference)> {
    let query_result = query(
        QueryFilter::new()
            .entry_type(EntryType::App(AppEntryType::new(
                EntryDefIndex::from(2),
                zome_info()?.zome_id,
                EntryVisibility::Private,
            )))
            .include_entries(true),
    )?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<PerGroupPreference> = element.1.to_app_option()?;

            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::err("104", "No entry found for per group preference."),
            }
        }
        None => crate::err("104", "No entry found for per group preference."),
    }
}

pub(crate) fn get_per_group_preference() -> ExternResult<PerGroupPreference> {
    Ok(PerGroupPreference {
        ..fetch_per_group_preference()?.1
    })
}

fn create_per_group_preference(preference: PerGroupPreference) -> ExternResult<PerGroupPreference> {
    match create_entry(&preference) {
        Ok(_) => Ok(preference),
        Err(_) => crate::err("100", "Problems were encountered during creation of entry"),
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
            _ => crate::err("104", "No entry found for per group preference."),
        },
    }
}
