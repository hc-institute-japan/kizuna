use hdk::prelude::*;

use super::EncryptInput;
use crate::group_encryption::get_agent_key::get_agent_key_handler;

pub fn encrypt_key_handler(input: EncryptInput) -> ExternResult<XSalsa20Poly1305EncryptedData> {
    let sender_key = get_agent_key_handler(input.sender.clone())?;
    let recipient_key = get_agent_key_handler(input.recipient.clone())?;

    let encrypted_data =
        x_25519_x_salsa20_poly1305_encrypt(sender_key.key, recipient_key.key, input.data)?;

    Ok(encrypted_data)
}
