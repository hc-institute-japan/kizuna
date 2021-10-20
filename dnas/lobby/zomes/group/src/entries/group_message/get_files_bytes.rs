use crate::utils::*;
use hdk::prelude::*;
use std::collections::hash_map::HashMap;

use super::GroupFileBytes;

pub fn get_files_bytes_handler(
    file_hashes: Vec<EntryHash>,
) -> ExternResult<HashMap<String, SerializedBytes>> {
    let mut all_file_bytes: HashMap<String, SerializedBytes> = HashMap::new();

    let get_input = file_hashes
        .into_iter()
        .map(|hash| GetInput::new(hash.into(), GetOptions::default()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get(get_input))?;

    let get_output_result: Vec<Element> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    for file_bytes_element in get_output_result {
        match file_bytes_element.entry().to_app_option::<GroupFileBytes>() {
            Ok(option) => match option {
                Some(file_bytes) => {
                    let file_hash = hash_entry(file_bytes.clone())?;
                    all_file_bytes.insert(file_hash.to_string(), file_bytes.0);
                }
                None => (),
            },
            Err(_) => {
                return error("the group file bytes ElementEntry enum is not of Present variant");
            }
        }
    }

    Ok(all_file_bytes)
}
