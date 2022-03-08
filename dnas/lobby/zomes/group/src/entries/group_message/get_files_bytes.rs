use crate::utils::*;
use hdk::prelude::*;
use std::collections::hash_map::HashMap;

use super::{EncryptedGroupFileBytes, GetFilesInput, GroupFileBytes};

use crate::group_encryption::{decrypt_file::decrypt_file_handler, DecryptFileInput};

pub fn get_files_bytes_handler(
    input: GetFilesInput,
) -> ExternResult<HashMap<String, SerializedBytes>> {
    let mut all_file_bytes: HashMap<String, SerializedBytes> = HashMap::new();

    let get_input = input
        .file_hashes_by_session
        .keys()
        .map(|hash| GetInput::new((*hash).clone().into(), GetOptions::latest()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get(get_input))?;

    let get_output_result: Vec<Element> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    for file_bytes_element in get_output_result {
        match file_bytes_element
            .entry()
            .to_app_option::<EncryptedGroupFileBytes>()
        {
            Ok(option) => match option {
                Some(encrypted_file_bytes) => {
                    let file_hash = hash_entry(encrypted_file_bytes.clone())?;
                    let decrypt_file_input = DecryptFileInput {
                        group_id: input.group_id.clone(),
                        session_id: *input.file_hashes_by_session.get(&file_hash).unwrap(),
                        encrypted_file_bytes: encrypted_file_bytes.0,
                    };
                    let group_file_bytes: GroupFileBytes =
                        decrypt_file_handler(decrypt_file_input)?;
                    all_file_bytes.insert(file_hash.to_string(), group_file_bytes.0);
                }
                None => (),
            },
            Err(_) => {
                return error(" the group file bytes ElementEntry enum is not of Present variant");
            }
        }
    }

    Ok(all_file_bytes)
}
