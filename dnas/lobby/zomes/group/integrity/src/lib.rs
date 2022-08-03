use hdi::prelude::*;
use group_integrity_types::{Group, GroupMessage, GroupFileBytes};

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
enum EntryTypes {
    #[entry_def(name="group" required_validations = 5, visibility = "public")]
    Group(Group),
    #[entry_def(name="group_message" required_validations = 5, visibility = "public")]
    GroupMessage(GroupMessage),
    #[entry_def(name="group_file_bytes" required_validations = 5, visibility = "public")]
    GroupFileBytes(GroupFileBytes),
}