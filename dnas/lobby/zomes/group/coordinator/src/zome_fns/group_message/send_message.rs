use hdk::prelude::*;

use crate::utils::*;
use group_coordinator_types::group_message::{GroupMessageInput, GroupMessageWithId, PayloadInput};
use group_integrity::LinkTypes;
use group_integrity_types::{FileMetadata, FileType, GroupFileBytes, GroupMessage, Payload};

pub fn send_message_handler(message_input: GroupMessageInput) -> ExternResult<GroupMessageWithId> {
    let payload = match message_input.payload_input.clone() {
        PayloadInput::Text { payload } => Payload::Text { payload },
        PayloadInput::File {
            metadata,
            file_type,
            file_bytes,
        } => {
            let group_file_bytes = GroupFileBytes(file_bytes);
            host_call::<CreateInput, ActionHash>(
                __create,
                CreateInput::new(
                    EntryDefLocation::app(2), // TODO: is there no way to not hardcode this?
                    EntryVisibility::Public,
                    Entry::App(group_file_bytes.clone().try_into()?),
                    ChainTopOrdering::Relaxed,
                ),
            )?;
            let group_file_bytes_hash = hash_entry(&group_file_bytes)?;
            Payload::File {
                file_type,
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
        let mut message_record: Option<Record> = None;
        // try to retrieve the message being replied to before proceeding.
        // return error if it can't be retrieved.
        while n < 3 && message_record == None {
            let options = GetOptions::latest();
            message_record = get(hash.clone(), options)?;
            n += 1
        }
        if let Some(e) = message_record {
            let replied_message = try_from_record(e)?;
            _replied_message_with_id = Some(GroupMessageWithId {
                id: hash,
                content: replied_message,
            })
        } else {
            return error(String::from("failed to get the replied message from DHT"));
        }
    }

    // commit GroupMessage entry
    host_call::<CreateInput, ActionHash>(
        __create,
        CreateInput::new(
            EntryDefLocation::app(1), // TODO: Find a way to not hardcode this
            EntryVisibility::Public,
            Entry::App(message.clone().try_into()?),
            ChainTopOrdering::Relaxed,
        ),
    )?;

    let group_hash = message.group_hash.clone().to_string(); // message's group hash as string
    let days = timestamp_to_days(message.created.clone()).to_string(); // group message's timestamp into days as string
    let group_hash_timestamp_path_hash = path_from_str(
        &[group_hash, days].join("."),
        LinkTypes::GroupHashTimestampPath,
    )?
    .path_entry_hash()?;
    // let scoped_link_type: ScopedLinkType = LinkTypes::TimestampPathToGroupMessage.try_into()?;
    let link_type: LinkType = LinkTypes::TimestampPathToGroupMessage.try_into()?;
    host_call::<CreateLinkInput, ActionHash>(
        __create_link,
        CreateLinkInput::new(
            group_hash_timestamp_path_hash.into(),
            hash_entry(&message)?.into(),
            // scoped_link_type.zome_id,
            // scoped_link_type.zome_type,
            link_type,
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
