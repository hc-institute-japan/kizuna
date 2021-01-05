use derive_more::{From, Into};
use hdk3::prelude::*;
pub mod handlers;

#[hdk_entry(id = "preference", visibility = "private")]
pub struct Preference {
    typing_indicator: bool,
    read_receipt: bool,
}

#[hdk_entry(id = "per_agent_preference", visibility = "private")]
pub struct PerAgentPreference {
    typing_indicator: Vec<AgentPubKey>,
    read_receipt: Vec<AgentPubKey>,
}

#[hdk_entry(id = "per_group_preference", visibility = "private")]
pub struct PerGroupPreference {
    typing_indicator: Vec<String>,
    read_receipt: Vec<String>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct PreferenceIO {
    typing_indicator: Option<bool>,
    read_receipt: Option<bool>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct PerAgentPreferenceIO {
    typing_indicator: Option<Vec<AgentPubKey>>,
    read_receipt: Option<Vec<AgentPubKey>>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct PerGroupPreferenceIO {
    typing_indicator: Option<Vec<String>>,
    read_receipt: Option<Vec<String>>,
}

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct PreferenceWrapper(PreferenceIO);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct PerAgentPreferenceWrapper(PerAgentPreferenceIO);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct PerGroupPreferenceWrapper(PerGroupPreferenceIO);
