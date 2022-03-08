use hdk::prelude::*;
use hdk::random::TryFromRandom;

use super::{
    decrypt_key::decrypt_key_handler, encrypt_key::encrypt_key_handler, DecryptInput, EncryptInput,
    EncryptedGroupKey, GroupKey,
};
use crate::group::{group_helpers::get_group_latest_version, GroupOutput};
use crate::utils::error;

pub fn create_key_handler(group_id: EntryHash) -> ExternResult<()> {
    // get latest session id and increment by 1
    // TODO: should we change the base of group_key entry to the group entry instead of the moderators agent pubkey?
    let links = get_links(
        agent_info()?.agent_latest_pubkey.into(),
        Some(LinkTag::new("latest_group_key")),
    )?;

    let get_input: Vec<GetInput> = links
        .clone()
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::latest()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get_details(get_input))?;

    let get_output_result: Vec<Details> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    let mut latest_session_id: u32 = 0;
    let mut decrypted_key: XSalsa20Poly1305KeyRef = TryFromRandom::try_from_random()?;

    if get_output_result.len() >= 1 {
        let latest_key_detail = get_output_result[0].clone();
        match latest_key_detail {
            Details::Entry(key_details) => {
                if let Entry::App(_key_bytes) = key_details.entry.clone() {
                    let encrypted_group_key: EncryptedGroupKey = key_details.entry.try_into()?;
                    let decrypted_group_key: GroupKey = decode(
                        &(decrypt_key_handler(DecryptInput {
                            sender: agent_info()?.agent_latest_pubkey,
                            recipient: agent_info()?.agent_latest_pubkey,
                            data: encrypted_group_key.key,
                        })?),
                    )?;
                    latest_session_id = encrypted_group_key.session_id + 1;
                    decrypted_key = decrypted_group_key.key;
                } else {
                    return error("This is a fatal error. Something is wrong with holochain 1.");
                }
            }
            _ => {
                return error("This is a fatal error. Something is wrong with holochain 2.");
            }
        }
    }

    // get members
    let latest_group_version: GroupOutput = get_group_latest_version(group_id.clone())?;
    let group_members: Vec<AgentPubKey> = latest_group_version.members;

    // encrypt, commit to DHT, and link to member
    for member in group_members {
        let encrypted_key = encrypt_key_handler(EncryptInput {
            sender: agent_info()?.agent_latest_pubkey,
            recipient: member.clone(),
            data: encode(&decrypted_key)?.into(),
        })?;

        let member_group_key = EncryptedGroupKey {
            session_id: latest_session_id,
            key: encrypted_key,
        };

        let member_group_key_entry = Entry::App(member_group_key.clone().try_into()?);
        let _member_group_key_hash = host_call::<CreateInput, HeaderHash>(
            __create,
            CreateInput::new(
                EncryptedGroupKey::entry_def().id,
                member_group_key_entry.clone(),
                ChainTopOrdering::Relaxed,
            ),
        )?;

        host_call::<CreateLinkInput, HeaderHash>(
            __create_link,
            CreateLinkInput::new(
                member.clone().into(),
                hash_entry(&member_group_key)?,
                LinkTag::new(
                    // (group_id.to_string() + "_" + &latest_session_id.to_string()).to_owned(),
                    (group_id.to_string() + "_group_key").to_owned(),
                ),
                ChainTopOrdering::Relaxed,
            ),
        )?;
    }

    // encrypt key using own pubkey
    let own_encrypted_key = encrypt_key_handler(EncryptInput {
        sender: agent_info()?.agent_latest_pubkey,
        recipient: agent_info()?.agent_latest_pubkey,
        data: encode(&decrypted_key)?.into(),
    })?;

    let own_group_key = EncryptedGroupKey {
        session_id: latest_session_id,
        key: own_encrypted_key,
    };

    let own_group_key_entry = Entry::App(own_group_key.clone().try_into()?);
    let _own_group_key_hash = host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            EncryptedGroupKey::entry_def().id,
            own_group_key_entry.clone(),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    // create link to new latest
    host_call::<CreateLinkInput, HeaderHash>(
        __create_link,
        CreateLinkInput::new(
            agent_info()?.agent_latest_pubkey.into(),
            hash_entry(&own_group_key)?,
            LinkTag::new((group_id.to_string() + "_" + &latest_session_id.to_string()).to_owned()),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    host_call::<CreateLinkInput, HeaderHash>(
        __create_link,
        CreateLinkInput::new(
            agent_info()?.agent_latest_pubkey.into(),
            hash_entry(&own_group_key)?,
            LinkTag::new((group_id.to_string() + "_group_key").to_owned()),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    // delete link to stale latest
    if links.len() == 1 {
        host_call::<DeleteLinkInput, HeaderHash>(
            __delete_link,
            DeleteLinkInput::new(links[0].create_link_hash.clone(), ChainTopOrdering::Relaxed),
        )?;
    }

    // create link from group to key
    host_call::<CreateLinkInput, HeaderHash>(
        __create_link,
        CreateLinkInput::new(
            group_id.clone().into(),
            hash_entry(&own_group_key)?,
            LinkTag::new(
                group_id.to_string()
                    + "_session_key"
                    + &own_group_key.session_id.clone().to_string(),
            ),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    return Ok(());
}
