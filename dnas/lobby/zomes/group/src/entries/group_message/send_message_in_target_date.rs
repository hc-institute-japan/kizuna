use file_types::FileMetadata;
use hdk::prelude::*;

use std::time::Duration;

use crate::group::group_helpers::get_group_latest_version;
use crate::signals::{SignalDetails, SignalName, SignalPayload};
use crate::utils::error;
use crate::utils::path_from_str;
use crate::utils::timestamp_to_days;
use crate::utils::to_timestamp;

use super::{
    GroupFileBytes, GroupMessage, GroupMessageData, GroupMessageInputWithDate, Payload,
    PayloadInput,
};

pub fn send_message_in_target_date_handler(
    message_input: GroupMessageInputWithDate,
) -> ExternResult<GroupMessageData> {
    let payload_res = match message_input.clone().payload {
        PayloadInput::Text { payload } => Ok(Payload::Text { payload }),
        PayloadInput::File {
            metadata,
            file_type,
            file_bytes,
        } => {
            let group_file_bytes = GroupFileBytes(file_bytes);
            create_entry(&group_file_bytes)?;
            match hash_entry(&group_file_bytes) {
                Ok(hash) => Ok(Payload::File {
                    file_type: file_type,
                    metadata: FileMetadata {
                        file_name: metadata.file_name,
                        file_size: metadata.file_size,
                        file_type: metadata.file_type,
                        file_hash: hash,
                    },
                }),
                Err(_) => error("Cannot hash file bytes"),
            }
        }
    };

    match payload_res {
        Ok(payload) => {
            let message = GroupMessage {
                group_hash: message_input.clone().group_hash,
                payload,
                created: to_timestamp(Duration::from_millis(message_input.clone().date)),
                sender: message_input.clone().sender,
                reply_to: message_input.clone().reply_to,
            };

            // commit GroupMessage entry
            create_entry(&message)?;

            let group_hash = message.clone().group_hash.to_string(); // message's group hash as string
            let days = timestamp_to_days(message.clone().created).to_string(); // group message's timestamp into days as string

            match path_from_str(&[group_hash, days].join(".")).hash() {
                Ok(hash) => {
                    create_link(
                        hash.clone(),
                        hash_entry(&message.clone())?,
                        LinkTag::new(match message.payload {
                            Payload::Text { payload: _ } => "text".to_owned(),
                            Payload::File {
                                metadata: _,
                                file_type: _,
                            } => "file".to_owned(),
                        }),
                    )?;

                    match get_group_latest_version(message.clone().group_hash) {
                        Ok(group) => {
                            let message_hash = hash_entry(&message.clone())?;
                            let group_message_data = GroupMessageData {
                                id: message_hash,
                                content: message,
                            };

                            let signal = SignalDetails {
                                name: SignalName::GROUP_MESSAGE_DATA.to_owned(),
                                payload: SignalPayload::GroupMessageData(
                                    group_message_data.clone(),
                                ),
                            };

                            remote_signal(
                                ExternIO::encode(signal)?,
                                [vec![group.clone().creator], group.clone().members]
                                    .concat()
                                    .into_iter()
                                    .filter_map(|agent| {
                                        if agent != message_input.clone().sender {
                                            Some(agent)
                                        } else {
                                            None
                                        }
                                    })
                                    .collect(),
                            )?;
                            Ok(group_message_data)
                        }
                        Err(_) => error("Cannot get group's latest version"),
                    }
                }
                Err(_) => error("Cannot create path"),
            }
        }
        Err(_) => error("Cannot convert payload input to payload"),
    }
}
