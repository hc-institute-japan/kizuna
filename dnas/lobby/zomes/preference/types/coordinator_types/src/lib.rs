use hdk::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PreferenceIO {
    pub typing_indicator: Option<bool>,
    pub read_receipt: Option<bool>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreferenceIO {
    pub typing_indicator: Option<Vec<AgentPubKey>>,
    pub read_receipt: Option<Vec<AgentPubKey>>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreferenceIO {
    pub typing_indicator: Option<Vec<String>>,
    pub read_receipt: Option<Vec<String>>,
}

pub enum QueryTarget{
    Preference,
    AgentPreference,
    GroupPreference,
}
