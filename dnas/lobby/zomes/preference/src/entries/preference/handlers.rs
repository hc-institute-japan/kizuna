use hdk3::prelude::*;

use super::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    create_entry(&Preference {
        typing_indicator: true,
        read_receipt: true
    })?;

    create_entry(&PerAgentPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new()
    })?;

    create_entry(&PerGroupPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new()
    })?;

    Ok(InitCallbackResult::Pass)
}

fn fetch_preference() -> ExternResult<(element::SignedHeaderHashed, Preference)> {
    let query_result = query(QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(0),
            zome_info()?.zome_id,
            EntryVisibility::Private
        )))
        .include_entries(true))?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<Preference> = element.1.to_app_option()?;
            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::error("No entry found for global preference. "),
            }
        }
        None => crate::error("qeqwe"),
    }
}
pub(crate) fn get_preference() -> ExternResult<PreferenceWrapper> {
    match fetch_preference() {
        Ok(unwrapped_preference) => Ok(PreferenceWrapper(Preference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::error("Something went wrong"),
    }
}

pub(crate) fn set_preference(preference: PreferenceIO) -> ExternResult<PreferenceWrapper> {
    match fetch_preference() {
        Ok(unwrapped_preference) => {
            let new_preference = Preference {
                typing_indicator: match preference.typing_indicator {
                    Some(boolean) => boolean,
                    _ => unwrapped_preference.1.typing_indicator,
                },
                read_receipt: match preference.read_receipt {
                    Some(boolean) => boolean,
                    _ => unwrapped_preference.1.read_receipt,
                }
            };
            update_entry(
                unwrapped_preference.0.into_inner().1,
                &new_preference
            )?;
            Ok(PreferenceWrapper(new_preference))
        }
        _ => crate::error("Something went wrong"),
    }
}

fn fetch_per_agent_preference() -> ExternResult<(element::SignedHeaderHashed, PerAgentPreference)> {
    let query_result = query(QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(1),
            zome_info()?.zome_id,
            EntryVisibility::Private
        )))
        .include_entries(true))?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<PerAgentPreference> = element.1.to_app_option()?;

            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::error("Something went wrong"),
            }
        }
        None => crate::error("Something went wrong"),
    }
}

pub(crate) fn get_per_agent_preference() -> ExternResult<PerAgentPreferenceWrapper> {
    match fetch_per_agent_preference() {
        Ok(unwrapped_preference) => Ok(PerAgentPreferenceWrapper(PerAgentPreference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::error("Something went wrong"),
    }
}

pub(crate) fn set_per_agent_preference(
    per_agent_preference: PerAgentPreferenceIO,
) -> ExternResult<PerAgentPreferenceWrapper> {
    match fetch_per_agent_preference() {
        Ok(unwrapped_preference) => {
            let new_preference = PerAgentPreference {
                typing_indicator: match per_agent_preference.clone().typing_indicator {
                    Some(agents) => {
                        unwrapped_preference
                            .1
                            .typing_indicator
                            .clone()
                            .into_iter()
                            .chain(agents)
                            .collect::<Vec<AgentPubKey>>()
                    }
                    _ => unwrapped_preference.1.typing_indicator.clone(),
                },
                read_receipt: match per_agent_preference.clone().read_receipt {
                    Some(agents) => {
                        unwrapped_preference
                            .1
                            .read_receipt
                            .clone()
                            .into_iter()
                            .chain(agents)
                            .collect::<Vec<AgentPubKey>>()
                    }
                    _ => unwrapped_preference.1.read_receipt.clone(),
                },
            };
            update_entry(
                unwrapped_preference.0.into_inner().1,
                &new_preference
            )?;
            Ok(PerAgentPreferenceWrapper(new_preference))
        }
        _ => crate::error("Something went wrong"),
    }
}

fn fetch_per_group_preference() -> ExternResult<(element::SignedHeaderHashed, PerGroupPreference)> {
    let query_result = query(QueryFilter::new()
        .entry_type(EntryType::App(AppEntryType::new(
            EntryDefIndex::from(2),
            zome_info()?.zome_id,
            EntryVisibility::Private
        )))
        .include_entries(true))?;
    match query_result.0.get(0) {
        Some(el) => {
            let element = el.clone().into_inner();
            let maybe_preference: Option<PerGroupPreference> = element.1.to_app_option()?;

            match maybe_preference {
                Some(preference) => Ok((element.0, preference)),
                _ => crate::error("Something went wrong"),
            }
        }
        None => crate::error("Something went wrong"),
    }
}

pub(crate) fn get_per_group_preference() -> ExternResult<PerGroupPreferenceWrapper> {
    match fetch_per_group_preference() {
        Ok(unwrapped_preference) => Ok(PerGroupPreferenceWrapper(PerGroupPreference {
            typing_indicator: unwrapped_preference.1.typing_indicator,
            read_receipt: unwrapped_preference.1.read_receipt,
        })),
        _ => crate::error("Something went wrong"),
    }
}

pub(crate) fn set_per_group_preference(
    per_group_preference: PerGroupPreferenceIO,
) -> ExternResult<PerGroupPreferenceWrapper> {
    match fetch_per_group_preference() {
        Ok(unwrapped_preference) => {
            let new_preference = PerGroupPreference {
                typing_indicator: match per_group_preference.clone().typing_indicator {
                    Some(agents) => {
                        unwrapped_preference
                            .1
                            .typing_indicator
                            .clone()
                            .into_iter()
                            .chain(agents)
                            .collect::<Vec<String>>()
                    }
                    _ => unwrapped_preference.1.typing_indicator.clone(),
                },
                read_receipt: match per_group_preference.clone().read_receipt {
                    Some(agents) => {
                        unwrapped_preference
                            .1
                            .read_receipt
                            .clone()
                            .into_iter()
                            .chain(agents)
                            .collect::<Vec<String>>()
                    }
                    _ => unwrapped_preference.1.read_receipt.clone(),
                }
            };
            update_entry(
                unwrapped_preference.0.into_inner().1,
                &new_preference
            )?;
            Ok(PerGroupPreferenceWrapper(new_preference))
        }
        _ => crate::error("Something went wrong"),
    }
}
