use hdk::prelude::*;

use super::{
    EncryptedGroupFileBytes, EncryptedGroupMessage, GroupMessage, GroupMessageInput,
    GroupMessageWithId,
};
// use crate::group_helpers::get_group_latest_version;
// use crate::signals::{SignalDetails, SignalName, SignalPayload};
use crate::group_encryption::{
    encrypt_file::encrypt_file_handler, encrypt_message::encrypt_message_handler, EncryptFileInput,
    EncryptMessageInput,
};
use crate::utils::*;
use file_types::{FileMetadata, FileType, Payload, PayloadInput};

pub fn send_message_handler(message_input: GroupMessageInput) -> ExternResult<GroupMessageWithId> {
    let payload = match message_input.payload_input.clone() {
        PayloadInput::Text { payload } => Payload::Text { payload },
        PayloadInput::File {
            metadata,
            file_type,
            file_bytes,
        } => {
            // encrypt file bytes
            let encrypt_file_input = EncryptFileInput {
                group_id: message_input.group_hash.clone(),
                file_bytes: file_bytes,
            };
            let encrypted_file_bytes = encrypt_file_handler(encrypt_file_input)?;

            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(
                    EncryptedGroupFileBytes::entry_def().id,
                    Entry::App(encrypted_file_bytes.clone().try_into()?),
                    ChainTopOrdering::Relaxed,
                ),
            )?;
            let group_file_bytes_hash = hash_entry(&encrypted_file_bytes)?;
            Payload::File {
                file_type: file_type,
                metadata: FileMetadata {
                    file_name: metadata.file_name,
                    file_size: metadata.file_size,
                    file_type: metadata.file_type,
                    file_hash: group_file_bytes_hash,
                },
            }
        }
    };

    let message = GroupMessage {
        group_hash: message_input.group_hash.clone(),
        payload,
        created: sys_time()?,
        sender: message_input.sender.clone(),
        reply_to: message_input.reply_to.clone(),
    };

    let mut _replied_message_with_id: Option<GroupMessageWithId> = None;
    if let Some(hash) = message_input.reply_to.clone() {
        let mut n = 0;
        let mut message_element: Option<Element> = None;
        // try to retrieve the message being replied to before proceeding.
        // return error if it can't be retrieved.
        while n < 3 && message_element == None {
            let options = GetOptions::latest();
            message_element = get(hash.clone(), options)?;
            n += 1
        }
        if let Some(e) = message_element {
            let replied_message = try_from_element(e)?;
            _replied_message_with_id = Some(GroupMessageWithId {
                id: hash,
                content: replied_message,
            })
        } else {
            return error("failed to get the replied message from DHT");
        }
    }

    // encrypt message
    let encrypt_input = EncryptMessageInput {
        group_id: message_input.group_hash.clone(),
        message: message.clone(),
    };
    let encrypted_message: EncryptedGroupMessage = encrypt_message_handler(encrypt_input)?;

    // create_entry(&message)?;
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            EncryptedGroupMessage::entry_def().id,
            Entry::App(encrypted_message.clone().try_into()?),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    let group_hash = message.group_hash.clone().to_string(); // message's group hash as string
    let days = timestamp_to_days(message.created.clone()).to_string(); // group message's timestamp into days as string
    let group_hash_timestamp_path_hash =
        path_from_str(&[group_hash, days].join("."))?.path_entry_hash()?;
    host_call::<CreateLinkInput, HeaderHash>(
        __create_link,
        CreateLinkInput::new(
            group_hash_timestamp_path_hash,
            hash_entry(&encrypted_message)?,
            LinkTag::new(match message.payload.clone() {
                Payload::Text { payload: _ } => "text".to_owned(),
                Payload::File {
                    metadata: _,
                    file_type,
                } => match file_type {
                    FileType::Image { thumbnail: _ } => "media".to_owned(),
                    FileType::Video { thumbnail: _ } => "media".to_owned(),
                    FileType::Other => "file".to_owned(),
                },
            }),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    let message_hash = hash_entry(&message)?;
    let group_message_with_id = GroupMessageWithId {
        id: message_hash,
        content: message,
    };

    Ok(group_message_with_id)
}
