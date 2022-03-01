use hdk::prelude::*;
use std::collections::HashMap;

use super::{
    decrypt_key::decrypt_key_handler, get_my_group_keys::get_my_group_keys_handler, DecryptInput,
    EncryptMessageInput, EncryptedGroupKey, GroupKey,
};
use crate::group::group_helpers::get_group_latest_version;
use crate::group_message::EncryptedGroupMessage;
use crate::utils::error;

pub fn encrypt_message_handler(input: EncryptMessageInput) -> ExternResult<EncryptedGroupMessage> {
    // get encrypting keys
    let keys: HashMap<u32, EncryptedGroupKey> = get_my_group_keys_handler(input.group_id.clone())?;
    // debug!("nicko got keys");

    let group = get_group_latest_version(input.group_id.clone())?;
    // debug!("nicko got group");

    // check if the latest key matches the session of the group
    let mut session_ids: Vec<_> = keys.keys().collect();
    session_ids.sort();
    // debug!("nicko sorted keys {:?}", session_ids.clone());

    // latest matches session
    // latest doesn't match session -> terminate
    if !(keys.is_empty()) {
        if *session_ids[session_ids.len() - 1] == group.session {
            // debug!("nicko session id contains group session");
            if let Some(current_group_key) = keys.get(&session_ids[session_ids.len() - 1]) {
                // debug!("nicko got session key {:?}", current_group_key.clone());
                let decrypt_input = DecryptInput {
                    sender: group.creator,
                    recipient: agent_info()?.agent_latest_pubkey,
                    data: current_group_key.key.clone(),
                };
                let decrypted_key_data: XSalsa20Poly1305Data = decrypt_key_handler(decrypt_input)?;
                // debug!("nicko decrypted key");
                let decrypted_key: XSalsa20Poly1305KeyRef = decode(&decrypted_key_data)?;
                let group_key = GroupKey {
                    session_id: group.session,
                    key: decrypted_key,
                };
                // debug!("nicko decoded key");
                let encrypted_message: XSalsa20Poly1305EncryptedData =
                    x_salsa20_poly1305_encrypt(group_key.key, encode(&input.message)?.into())?;
                // debug!("nicko encrypted message");
                let encrypted_group_message = EncryptedGroupMessage {
                    group_hash: input.group_id,
                    session_id: current_group_key.session_id,
                    data: encrypted_message,
                };
                Ok(encrypted_group_message)
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
