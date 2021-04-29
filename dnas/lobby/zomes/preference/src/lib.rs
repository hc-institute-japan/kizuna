use hdk::prelude::*;
mod entries;
use entries::preference;

use preference::*;



entry_defs![
    Preference::entry_def(),
    PerAgentPreference::entry_def(),
    PerGroupPreference::entry_def()
];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

pub fn err<T>(code: &str, message: &str) -> ExternResult<T> {
    Err(WasmError::Guest(format!(
        "{{\"code\": \"{}\", \"message\": \"{}\"}}",
        code, message
    )))
}

#[hdk_extern]
fn get_preference(_: ()) -> ExternResult<Preference> {
    handlers::get_preference()
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
    handlers::get_per_agent_preference()
}

#[hdk_extern]
fn set_per_group_preference(preference: PerGroupPreferenceIO) -> ExternResult<PerGroupPreference> {
    handlers::set_per_group_preference(preference)
}

#[hdk_extern]
fn get_per_group_preference(_: ()) -> ExternResult<PerGroupPreference> {
    handlers::get_per_group_preference()
}
