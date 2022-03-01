use hdk::prelude::*;
use std::collections::HashMap;

use super::{
    decrypt_key::decrypt_key_handler, get_my_group_keys::get_my_group_keys_handler, DecryptInput,
    DecryptMessageInput, EncryptedGroupKey, GroupKey,
};
use crate::group::group_helpers::get_group_latest_version;
use crate::group_message::GroupMessage;
use crate::utils::error;

pub fn decrypt_message_handler(input: DecryptMessageInput) -> ExternResult<GroupMessage> {
    debug!(
        "nicko decrypt message handler by agent {:?}",
        agent_info()?.agent_latest_pubkey
    );

    // get decrypting keys
    let keys: HashMap<u32, EncryptedGroupKey> = get_my_group_keys_handler(input.group_id.clone())?;
    debug!("nicko decrypt message got keys");

    // check if the session key of the message matches any of the decrypting keys
    let message_session = input.message.session_id;
    if let Some(decrypting_key) = keys.get(&message_session) {
        let group = get_group_latest_version(input.group_id.clone())?;
        let decrypt_input = DecryptInput {
            sender: group.creator,
            recipient: agent_info()?.agent_latest_pubkey,
            data: decrypting_key.key.clone(),
        };
        let decrypted_key_data: XSalsa20Poly1305Data = decrypt_key_handler(decrypt_input)?;
        debug!("nicko decrypt message decrypted key");
        let decrypted_key: XSalsa20Poly1305KeyRef = decode(&decrypted_key_data)?;
        debug!("nicko decrypt message decoded key");
        let group_key = GroupKey {
            session_id: group.session,
            key: decrypted_key,
        };

        if let Some(decrypted_encoded_message) =
            x_salsa20_poly1305_decrypt(group_key.key, input.message.data)?
        {
            debug!("nicko decrypt message decrypted message");
            let decrypted_message: GroupMessage = decode(&decrypted_encoded_message)?;
            Ok(decrypted_message)
        } else {
            debug!("nicko decrypt message cannot decrypt message");
            return error("Cannot decrypt message");
        }
    } else {
        debug!("nicko decrypt message no key");
        return error("You do not have a key for this message");
    }
}
