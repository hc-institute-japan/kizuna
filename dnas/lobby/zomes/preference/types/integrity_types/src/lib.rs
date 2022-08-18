use holochain_deterministic_integrity::prelude::*;

#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
pub struct Preference {
    pub typing_indicator: bool,
    pub read_receipt: bool,
}

#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreference {
    pub typing_indicator: Vec<AgentPubKey>,
    pub read_receipt: Vec<AgentPubKey>,
}

#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreference {
    pub typing_indicator: Vec<String>,
    pub read_receipt: Vec<String>,
}
