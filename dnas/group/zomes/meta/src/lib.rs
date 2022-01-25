use hdk::prelude::*;
use std::collections::BTreeSet;

mod entries;
mod utils;

use entries::meta::{
    create_group_meta::create_group_meta_handler, get_group_metadata::get_group_metadata_handler,
    GroupDnaMeta,
};

entry_defs![GroupDnaMeta::entry_def(), Path::entry_def()];

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = BTreeSet::new();
    let tag: String = "meta_zome_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;
    let zome_name: ZomeName = zome_info()?.name;

    fuctions.insert((zome_name.clone(), FunctionName("recv_remote_signal".into())));

    let cap_grant_entry: CapGrantEntry = CapGrantEntry::new(
        tag,    // A string by which to later query for saved grants.
        access, // Unrestricted access means any external agent can call the extern
        fuctions,
    );

    // TODO: Create a path here for meta data to be linked from

    create_cap_grant(cap_grant_entry)?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    emit_signal(&signal)?;
    Ok(())
}

#[hdk_extern]
fn create_group_meta(group_dna_meta: GroupDnaMeta) -> ExternResult<GroupDnaMeta> {
    create_group_meta_handler(group_dna_meta)
}

#[hdk_extern]
fn get_group_meta(_: ()) -> ExternResult<GroupDnaMeta> {
    get_group_metadata_handler()
}

#[hdk_extern]
fn test_function(_: ()) -> ExternResult<String> {
    Ok(String::from("Testing cloning of DNA: SUCCESS!"))
}
