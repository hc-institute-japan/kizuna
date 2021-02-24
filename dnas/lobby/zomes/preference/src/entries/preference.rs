use hdk3::prelude::*;
pub mod handlers;

#[derive(Serialize, Deserialize, SerializedBytes, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Preference {
    typing_indicator: bool,
    read_receipt: bool,
}

entry_def!(Preference EntryDef {
    id: "preference".into(),
    visibility: EntryVisibility::Private,
    crdt_type: CrdtType,
    required_validations: RequiredValidations::default(),
    required_validation_type: RequiredValidationType::Element
});

#[derive(Serialize, Deserialize, SerializedBytes, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreference {
    typing_indicator: Vec<AgentPubKey>,
    read_receipt: Vec<AgentPubKey>,
}

entry_def!(PerAgentPreference EntryDef {
    id: "per_agent_preference".into(),
    visibility: EntryVisibility::Private,
    crdt_type: CrdtType,
    required_validations: RequiredValidations::default(),
    required_validation_type: RequiredValidationType::Element
});

#[derive(Serialize, Deserialize, SerializedBytes, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreference {
    typing_indicator: Vec<String>,
    read_receipt: Vec<String>,
}

entry_def!(PerGroupPreference EntryDef {
    id: "per_group_preference".into(),
    visibility: EntryVisibility::Private,
    crdt_type: CrdtType,
    required_validations: RequiredValidations::default(),
    required_validation_type: RequiredValidationType::Element
});

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PreferenceIO {
    typing_indicator: Option<bool>,
    read_receipt: Option<bool>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreferenceIO {
    typing_indicator: Option<Vec<AgentPubKey>>,
    read_receipt: Option<Vec<AgentPubKey>>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreferenceIO {
    typing_indicator: Option<Vec<String>>,
    read_receipt: Option<Vec<String>>,
}
