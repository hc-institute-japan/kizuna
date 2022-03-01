use hdk::prelude::*;
use hdk::x_salsa20_poly1305::x_25519_x_salsa20_poly1305_decrypt;

use super::DecryptInput;
use crate::group_encryption::get_agent_key::get_agent_key_handler;
use crate::utils::error;

pub fn decrypt_key_handler(input: DecryptInput) -> ExternResult<XSalsa20Poly1305Data> {
    debug!(
        "nicko decrypt key handler input recipient {:?}, sender {:?}",
        input.recipient.clone(),
        input.sender.clone()
    );
    let recipient_key = get_agent_key_handler(input.recipient.clone())?;
    let sender_key = get_agent_key_handler(input.sender.clone())?;

    debug!("nicko decrypt key attempting to decrpyt");

    let decrypted_data = match agent_info()?.agent_latest_pubkey == input.sender.clone() {
        true => x_25519_x_salsa20_poly1305_decrypt(recipient_key.key, sender_key.key, input.data)?,
        false => x_25519_x_salsa20_poly1305_decrypt(sender_key.key, recipient_key.key, input.data)?,
    };

    debug!(
        "nicko decrypt key decrypt result {:?}",
        decrypted_data.clone()
    );

    match decrypted_data {
        Some(key) => {
            debug!("nicko decrypt key successfully decrypted");
            Ok(key)
        }
        None => {
            debug!("nicko decrypt key failed to decrypt");
            return error("Cannot decrpyt data");
        }
    }
    // if let Some(decrypted_data) =
    //     x_25519_x_salsa20_poly1305_decrypt(recipient_key.key, sender_key.key, input.data)?
    // {
    //     debug!("nicko decrypt key successfully decrypted");
    //     Ok(decrypted_data)
    // } else {
    //     debug!("nicko decrypt key failed to decrypt");
    //     return error("Cannot decrypt data");
    // }
}
