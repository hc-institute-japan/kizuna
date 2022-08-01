use hdi::prelude::*;
use preference_integrity_types::*;

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