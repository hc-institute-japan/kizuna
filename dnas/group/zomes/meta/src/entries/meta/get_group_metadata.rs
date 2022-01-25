use super::GroupDnaMeta;
use crate::utils::*;
use hdk::prelude::*;

pub fn get_group_metadata_handler() -> ExternResult<GroupDnaMeta> {
    let meta_path_hash = path_from_str("group_dna_metadata").hash()?;
    let links = get_links(meta_path_hash, Some(LinkTag::new("metadata")))?;
    // TODO: change to retrieving the latest metadata
    let dna_meta: GroupDnaMeta =
        try_get_and_convert(links[0].target.clone(), GetOptions::default())?;
    Ok(dna_meta)
}
