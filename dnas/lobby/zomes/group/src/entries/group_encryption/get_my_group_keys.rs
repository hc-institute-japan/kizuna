use hdk::prelude::*;

use super::EncryptedGroupKey;
// use crate::utils::error;
use std::collections::hash_map::HashMap;

pub fn get_my_group_keys_handler(
    group_id: EntryHash,
) -> ExternResult<HashMap<u32, EncryptedGroupKey>> {
    let links = get_links(
        agent_info()?.agent_latest_pubkey.into(),
        Some(LinkTag::new(
            (group_id.to_string() + "_group_key").to_owned(),
        )),
    )?;

    let get_input: Vec<GetInput> = links
        .clone()
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::latest()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get_details(get_input))?;

    let get_output_result: Vec<Details> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    let mut all_keys: HashMap<u32, EncryptedGroupKey> = HashMap::new();

    for details in get_output_result {
        match details {
            Details::Entry(entry_details) => {
                if let Entry::App(_encrypted_group_key_entry) = entry_details.entry.clone() {
                    let encrypted_group_key: EncryptedGroupKey = entry_details.entry.try_into()?;
                    all_keys.insert(encrypted_group_key.session_id, encrypted_group_key);
                }
            }
            _ => {
                continue;
            }
        }
    }

    return Ok(all_keys);
}
