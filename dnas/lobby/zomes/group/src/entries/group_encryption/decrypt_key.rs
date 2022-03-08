use hdk::prelude::*;
use hdk::x_salsa20_poly1305::x_25519_x_salsa20_poly1305_decrypt;

use super::DecryptInput;
use crate::group_encryption::get_agent_key::get_agent_key_handler;
use crate::utils::error;

pub fn decrypt_key_handler(input: DecryptInput) -> ExternResult<XSalsa20Poly1305Data> {
    let recipient_key = get_agent_key_handler(input.recipient.clone())?;
    let sender_key = get_agent_key_handler(input.sender.clone())?;

    let decrypted_data = match agent_info()?.agent_latest_pubkey == input.sender.clone() {
        true => x_25519_x_salsa20_poly1305_decrypt(recipient_key.key, sender_key.key, input.data)?,
        false => x_25519_x_salsa20_poly1305_decrypt(sender_key.key, recipient_key.key, input.data)?,
    };

    match decrypted_data {
        Some(key) => Ok(key),
        None => {
            return error("Cannot decrpyt data");
        }
    }
}
