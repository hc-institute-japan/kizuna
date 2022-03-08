use hdk::prelude::*;
use std::collections::HashMap;

use super::{
    decrypt_key::decrypt_key_handler, get_my_group_keys::get_my_group_keys_handler,
    DecryptFileInput, DecryptInput, EncryptedGroupKey, GroupKey,
};
use crate::group::group_helpers::get_group_latest_version;
use crate::group_message::GroupFileBytes;
use crate::utils::error;

pub fn decrypt_file_handler(input: DecryptFileInput) -> ExternResult<GroupFileBytes> {
    // get decrypting keys
    let keys: HashMap<u32, EncryptedGroupKey> = get_my_group_keys_handler(input.group_id.clone())?;

    // check if the session key of the message matches any of the decrypting keys
    let message_session = input.session_id;
    if let Some(decrypting_key) = keys.get(&message_session) {
        let group = get_group_latest_version(input.group_id.clone())?;
        let decrypt_input = DecryptInput {
            sender: group.creator,
            recipient: agent_info()?.agent_latest_pubkey,
            data: decrypting_key.key.clone(),
        };
        let decrypted_key_data: XSalsa20Poly1305Data = decrypt_key_handler(decrypt_input)?;
        let decrypted_key: XSalsa20Poly1305KeyRef = decode(&decrypted_key_data)?;
        let group_key = GroupKey {
            session_id: group.session,
            key: decrypted_key,
        };

        if let Some(decrypted_file_bytes) =
            x_salsa20_poly1305_decrypt(group_key.key, input.encrypted_file_bytes)?
        {
            let decrypted_file_bytes: SerializedBytes = decode(&decrypted_file_bytes)?;
            Ok(GroupFileBytes(decrypted_file_bytes))
        } else {
            return error("Cannot decrypt message");
        }
    } else {
        return error("You do not have a key for this message");
    }
}
