use hdk::prelude::*;
mod entries;
use entries::preference::{self, handlers};

use preference::*;

// entry_defs![
//     Preference::entry_def(),
//     PerAgentPreference::entry_def(),
//     PerGroupPreference::entry_def()
// ];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(wasm_error!(WasmErrorInner::Guest(String::from(reason))))
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    create_entry(&EntryTypes::Preference(Preference {
        typing_indicator: true,
        read_receipt: true,
    }))?;

    create_entry(&EntryTypes::PerAgentPreference(PerAgentPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new(),
    }))?;

    create_entry(&EntryTypes::PerGroupPreference(PerGroupPreference {
        typing_indicator: Vec::new(),
        read_receipt: Vec::new(),
    }))?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn get_preference(_: ()) -> ExternResult<Preference> {
    Ok(Preference {
        ..handlers::fetch_preference()?.1
    })
}

#[hdk_extern]
fn set_preference(preference: PreferenceIO) -> ExternResult<Preference> {
    handlers::set_preference(preference)
}

#[hdk_extern]
fn set_per_agent_preference(preference: PerAgentPreferenceIO) -> ExternResult<PerAgentPreference> {
    handlers::set_per_agent_preference(preference)
}

#[hdk_extern]
fn get_per_agent_preference(_: ()) -> ExternResult<PerAgentPreference> {
    Ok(PerAgentPreference {
        ..handlers::fetch_per_agent_preference()?.1
    })
}

#[hdk_extern]
fn set_per_group_preference(preference: PerGroupPreferenceIO) -> ExternResult<PerGroupPreference> {
    handlers::set_per_group_preference(preference)
}

#[hdk_extern]
fn get_per_group_preference(_: ()) -> ExternResult<PerGroupPreference> {
    Ok(PerGroupPreference {
        ..handlers::fetch_per_group_preference()?.1
    })
}
