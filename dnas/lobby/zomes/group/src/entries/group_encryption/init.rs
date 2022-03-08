use hdk::prelude::*;

use super::IdentityKey;

pub fn init_handler() -> ExternResult<InitCallbackResult> {
    let identity_key = IdentityKey {
        agent: agent_info()?.agent_latest_pubkey.into(),
        key: create_x25519_keypair()?,
    };

    let identity_key_entry = Entry::App(identity_key.clone().try_into()?);

    let _identity_key_hash = host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            IdentityKey::entry_def().id,
            identity_key_entry.clone(),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    host_call::<CreateLinkInput, HeaderHash>(
        __create_link,
        CreateLinkInput::new(
            agent_info()?.agent_latest_pubkey.into(),
            hash_entry(identity_key_entry)?,
            LinkTag::new("identity_key".to_owned()),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    Ok(InitCallbackResult::Pass)
}
