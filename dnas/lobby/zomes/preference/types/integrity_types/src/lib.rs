use holochain_deterministic_integrity::prelude::*;

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct Preference {
    pub typing_indicator: bool,
    pub read_receipt: bool,
}

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct PerAgentPreference {
    pub typing_indicator: Vec<AgentPubKey>,
    pub read_receipt: Vec<AgentPubKey>,
}

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct PerGroupPreference {
    pub typing_indicator: Vec<String>,
    pub read_receipt: Vec<String>,
}
