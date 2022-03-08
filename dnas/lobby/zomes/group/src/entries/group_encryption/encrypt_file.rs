use hdk::prelude::*;
use std::collections::HashMap;

use super::{
    decrypt_key::decrypt_key_handler, get_my_group_keys::get_my_group_keys_handler, DecryptInput,
    EncryptFileInput, EncryptedGroupKey, GroupKey,
};
use crate::group::group_helpers::get_group_latest_version;
use crate::group_message::EncryptedGroupFileBytes;
use crate::utils::error;

pub fn encrypt_file_handler(input: EncryptFileInput) -> ExternResult<EncryptedGroupFileBytes> {
    // get encrypting keys
    let keys: HashMap<u32, EncryptedGroupKey> = get_my_group_keys_handler(input.group_id.clone())?;

    let group = get_group_latest_version(input.group_id.clone())?;

    // check if the latest key matches the session of the group
    let mut session_ids: Vec<_> = keys.keys().collect();
    session_ids.sort();

    // latest matches session
    // latest doesn't match session -> terminate
    if !(keys.is_empty()) {
        if *session_ids[session_ids.len() - 1] == group.session {
            if let Some(current_group_key) = keys.get(&session_ids[session_ids.len() - 1]) {
                let decrypt_input = DecryptInput {
                    sender: group.creator,
                    recipient: agent_info()?.agent_latest_pubkey,
                    data: current_group_key.key.clone(),
                };
                let decrypted_key_data: XSalsa20Poly1305Data = decrypt_key_handler(decrypt_input)?;
                let decrypted_key: XSalsa20Poly1305KeyRef = decode(&decrypted_key_data)?;
                let group_key = GroupKey {
                    session_id: group.session,
                    key: decrypted_key,
                };
                let encrypted_file_bytes_data: XSalsa20Poly1305EncryptedData =
                    x_salsa20_poly1305_encrypt(group_key.key, encode(&input.file_bytes)?.into())?;

                let encrypted_file_bytes = EncryptedGroupFileBytes(encrypted_file_bytes_data);
                Ok(encrypted_file_bytes)
            } else {
                return error("Cannot fetch group key");
            }
        } else {
            return error("Agent is not part of the current group session.");
        }
    } else {
        return error("No keys found");
    }
}
