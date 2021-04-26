use hdk::prelude::*;

use super::{GroupFileBytes, GroupMessage, GroupMessageData, GroupMessageInput};
use crate::group_helpers::get_group_latest_version;
use crate::signals::{SignalDetails, SignalName, SignalPayload};
use crate::utils::*;
use file_types::{FileMetadata, FileType, Payload, PayloadInput};

pub fn send_message_handler(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
    let payload = match message_input.payload_input.clone() {
        PayloadInput::Text { payload } => Payload::Text { payload },
        PayloadInput::File {
            metadata,
            file_type,
            file_bytes,
        } => {
            let group_file_bytes = GroupFileBytes(file_bytes);
            create_entry(&group_file_bytes)?;
            let group_file_bytes_hash = hash_entry(&group_file_bytes)?;
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
        created: to_timestamp(sys_time()?),
        sender: message_input.sender.clone(),
        reply_to: message_input.reply_to.clone(),
    };

    // commit GroupMessage entry

    create_entry(&message)?;

    let group_hash = message.group_hash.clone().to_string(); // message's group hash as string
    let days = timestamp_to_days(message.created.clone()).to_string(); // group message's timestamp into days as string

    let group_hash_timestamp_path_hash = path_from_str(&[group_hash, days].join(".")).hash()?;

    create_link(
        group_hash_timestamp_path_hash,
        hash_entry(&message)?,
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
    )?;

    let latest_group_version = get_group_latest_version(message.group_hash.clone())?;

    let message_hash = hash_entry(&message)?;
    let group_message_data = GroupMessageData {
        id: message_hash,
        content: message,
    };

    let signal = SignalDetails {
        name: SignalName::GROUP_MESSAGE_DATA.to_owned(),
        payload: SignalPayload::GroupMessageData(group_message_data.clone()),
    };

    remote_signal(
        ExternIO::encode(signal)?,
        [
            vec![latest_group_version.creator.clone()],
            latest_group_version.members.clone(),
        ]
        .concat()
        .into_iter()
        .filter_map(|agent| {
            if &agent != &message_input.sender {
                Some(agent)
            } else {
                None
            }
        })
        .collect(),
    )?;
    Ok(group_message_data)
}
