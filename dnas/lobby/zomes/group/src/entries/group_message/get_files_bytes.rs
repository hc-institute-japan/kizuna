use crate::utils::*;
use hdk::prelude::*;
use std::collections::hash_map::HashMap;

use super::GroupFileBytes;

pub fn get_files_bytes_handler(
    file_hashes: Vec<EntryHash>,
) -> ExternResult<HashMap<String, SerializedBytes>> {
    let mut all_file_bytes: HashMap<String, SerializedBytes> = HashMap::new();

    /* We are only concerned with the content and not the metadata here */
    for file_hash in file_hashes {
        if let Some(file_bytes_element) = get(file_hash.clone(), GetOptions::content())? {
            match file_bytes_element.entry().to_app_option::<GroupFileBytes>() {
                Ok(option) => match option {
                    Some(file_bytes) => {
                        all_file_bytes.insert(file_hash.to_string(), file_bytes.0);
                    }
                    None => {}
                },
                Err(_) => {
                    return error(
                        "the group file bytes ElementEntry enum is not of Present variant",
                    );
                }
            }
        } else {
            return error("The file bytes were not found");
        }
    }
    Ok(all_file_bytes)
}
