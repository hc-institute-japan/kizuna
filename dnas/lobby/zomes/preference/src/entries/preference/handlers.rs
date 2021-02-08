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

pub(crate) fn get_preference() -> ExternResult<PreferenceWrapper> {
    match fetch_preference() {
        Ok(unwrapped_preference) => Ok(PreferenceWrapper(Preference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::err("104", "No entry found for global preference."),
    }
}

fn create_preference(preference: Preference) -> PreferenceWrapper {
    match create_entry(&preference) {
        Ok(_) => debug!("Create entry preference success"),
        Err(_) => crate::err::<()>("100", "Problems were encountered during creation of entry")
            .expect("Entry should be of type Preference"),
    };
    return PreferenceWrapper(preference);
}

pub(crate) fn set_preference(preference: PreferenceIO) -> ExternResult<PreferenceWrapper> {
    match (preference.typing_indicator, preference.read_receipt) {
        (Some(typing_indicator), Some(read_receipt)) => Ok(create_preference(Preference {
            typing_indicator,
            read_receipt,
        })),
        _ => match fetch_preference() {
            Ok(unwrapped_preference) => Ok(create_preference(Preference {
                typing_indicator: preference
                    .typing_indicator
                    .unwrap_or(unwrapped_preference.1.typing_indicator),
                read_receipt: preference
                    .read_receipt
                    .unwrap_or(unwrapped_preference.1.read_receipt),
            })),
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

pub(crate) fn get_per_agent_preference() -> ExternResult<PerAgentPreferenceWrapper> {
    match fetch_per_agent_preference() {
        Ok(unwrapped_preference) => Ok(PerAgentPreferenceWrapper(PerAgentPreference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::err("104", "No entry found for per agent preference."),
    }
}

fn create_per_agent_preference(preference: PerAgentPreference) -> PerAgentPreferenceWrapper {
    match create_entry(&preference) {
        Ok(_) => debug!("Successfully created a PerAgentPreference entry"),
        Err(_) => crate::err::<()>("100", "Problems were encountered during creation of entry")
            .expect("Entry should be of type PerAgentPreference"),
    };
    return PerAgentPreferenceWrapper(preference);
}

pub(crate) fn set_per_agent_preference(
    per_agent_preference: PerAgentPreferenceIO,
) -> ExternResult<PerAgentPreferenceWrapper> {
    match (
        per_agent_preference.clone().typing_indicator,
        per_agent_preference.clone().read_receipt,
    ) {
        (Some(typing_indicator), Some(read_receipt)) => {
            Ok(create_per_agent_preference(PerAgentPreference {
                typing_indicator,
                read_receipt,
            }))
        }
        _ => match fetch_per_agent_preference() {
            Ok(unwrapped_preference) => Ok(create_per_agent_preference(PerAgentPreference {
                typing_indicator: per_agent_preference
                    .clone()
                    .typing_indicator
                    .unwrap_or(unwrapped_preference.1.typing_indicator.clone()),
                read_receipt: per_agent_preference
                    .clone()
                    .read_receipt
                    .unwrap_or(unwrapped_preference.1.read_receipt.clone()),
            })),
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

pub(crate) fn get_per_group_preference() -> ExternResult<PerGroupPreferenceWrapper> {
    match fetch_per_group_preference() {
        Ok(unwrapped_preference) => Ok(PerGroupPreferenceWrapper(PerGroupPreference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::err("104", "No entry found for per grou preference."),
    }
}

fn create_per_group_preference(preference: PerGroupPreference) -> PerGroupPreferenceWrapper {
    match create_entry(&preference) {
        Ok(_) => debug!("Successfully created a PerGroupPreference entry"),
        Err(_) => crate::err::<()>("100", "Problems were encountered during creation of entry")
            .expect("Entry should be of type PerGroupPreference"),
    };
    return PerGroupPreferenceWrapper(preference);
}

pub(crate) fn set_per_group_preference(
    per_group_preference: PerGroupPreferenceIO,
) -> ExternResult<PerGroupPreferenceWrapper> {
    match (
        per_group_preference.clone().typing_indicator,
        per_group_preference.clone().read_receipt,
    ) {
        (Some(typing_indicator), Some(read_receipt)) => {
            Ok(create_per_group_preference(PerGroupPreference {
                typing_indicator,
                read_receipt,
            }))
        }
        _ => match fetch_per_group_preference() {
            Ok(unwrapped_preference) => Ok(create_per_group_preference(PerGroupPreference {
                typing_indicator: per_group_preference
                    .clone()
                    .typing_indicator
                    .unwrap_or(unwrapped_preference.1.typing_indicator.clone()),
                read_receipt: match per_group_preference.clone().read_receipt {
                    Some(read_receipt) => read_receipt,
                    _ => unwrapped_preference.1.read_receipt.clone(),
                },
            })),
            _ => crate::err("104", "No entry found for per group preference."),
        },
    }
}
