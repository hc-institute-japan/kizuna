use hdk::prelude::*;
pub mod handlers;

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct Preference {
    pub typing_indicator: bool,
    pub read_receipt: bool,
}

// entry_def!(Preference EntryDef {
//     id: "preference".into(),
//     visibility: EntryVisibility::Private,
//     crdt_type: CrdtType,
//     required_validations: RequiredValidations::default(),
//     required_validation_type: RequiredValidationType::Element
// });

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct PerAgentPreference {
    pub typing_indicator: Vec<AgentPubKey>,
    pub read_receipt: Vec<AgentPubKey>,
}

// entry_def!(PerAgentPreference EntryDef {
//     id: "per_agent_preference".into(),
//     visibility: EntryVisibility::Private,
//     crdt_type: CrdtType,
//     required_validations: RequiredValidations::default(),
//     required_validation_type: RequiredValidationType::Element
// });

// #[serde(rename_all = "camelCase")]
#[derive(PartialEq, Clone)]
#[hdk_entry_helper]
pub struct PerGroupPreference {
    pub typing_indicator: Vec<String>,
    pub read_receipt: Vec<String>,
}

// entry_def!(PerGroupPreference EntryDef {
//     id: "per_group_preference".into(),
//     visibility: EntryVisibility::Private,
//     crdt_type: CrdtType,
//     required_validations: RequiredValidations::default(),
//     required_validation_type: RequiredValidationType::Element
// });

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    #[entry_def(required_validations = 5, visibility = "private")]
    Preference(Preference),
    #[entry_def(required_validations = 5, visibility = "private")]
    PerAgentPreference(PerAgentPreference),
    #[entry_def(required_validations = 5, visibility = "private")]
    PerGroupPreference(PerGroupPreference),
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PreferenceIO {
    typing_indicator: Option<bool>,
    read_receipt: Option<bool>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreferenceIO {
    typing_indicator: Option<Vec<AgentPubKey>>,
    read_receipt: Option<Vec<AgentPubKey>>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreferenceIO {
    typing_indicator: Option<Vec<String>>,
    read_receipt: Option<Vec<String>>,
}

pub enum QueryTarget{
    Preference,
    AgentPreference,
    GroupPreference,
}
