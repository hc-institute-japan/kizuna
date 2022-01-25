use super::GroupDnaMeta;
use crate::utils::*;
use hdk::prelude::*;

pub fn create_group_meta_handler(group_dna_meta: GroupDnaMeta) -> ExternResult<GroupDnaMeta> {
    let meta_path_hash = path_from_str("group_dna_metadata").hash()?;
    let meta_hash = hash_entry(group_dna_meta.clone())?;
    debug!("here's the dna_meta_hash, {:?}", meta_hash);
    // TODO: Implement role based system so that only admins
    // can create and update metadata
    create_entry(group_dna_meta.clone())?;
    debug!("meta entry has been created");
    create_link(
        meta_path_hash, // change this to the path created in init()
        meta_hash,
        LinkTag::new(String::from("metadata")),
    )?;
    debug!("link has been created");
    Ok(group_dna_meta)
}
