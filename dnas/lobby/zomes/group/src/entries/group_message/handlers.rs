#![allow(unused_imports)]
use file_types::FileMetadata;
use group::Group;
use hdk3::{host_fn::remote_signal, prelude::*};
use link::Link;

use crate::{
    entries::group::{self, handlers::get_group_latest_version},
    signals::{SignalDetails, SignalName, SignalPayload},
    utils::{collect, path_from_str, timestamp_to_days, to_timestamp},
};

use super::{
    GroupChatFilter, GroupFileBytes, GroupMessage, GroupMessageData, GroupMessageDataWrapper,
    GroupMessageInput, GroupMessageReadData, GroupTypingDetailData, Payload, PayloadInput,
};

pub fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
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
        LinkTag::new(match message.payload {
            Payload::Text { payload: _ } => "text".to_owned(),
            Payload::File {
                metadata: _,
                file_type: _,
            } => "file".to_owned(),
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
        &signal,
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

pub fn get_all_messages(group_hash: EntryHash) -> ExternResult<GroupMessageDataWrapper> {
    let path = Path::from(group_hash.clone().to_string());
    let result = get_links(path.hash()?, None)
        .and_then(|timestamp_links| {
            collect(timestamp_links.into_inner(), |timestamp_link| {
                get_links(timestamp_link.target, None)
            })
        })
        .and_then(|message_links| {
            collect(message_links, |message_link| {
                collect(message_link.into_inner(), |element_link| {
                    get(element_link.target, GetOptions::default())
                })
                .and_then(|elements| {
                    Ok(elements
                        .into_iter()
                        .filter_map(|element| match element {
                            Some(entry) => {
                                if let Ok(Some(message)) =
                                    entry.into_inner().1.to_app_option::<GroupMessage>()
                                {
                                    match hash_entry(&message.clone()) {
                                        Ok(hash) => {
                                            return Some(GroupMessageData {
                                                id: hash,
                                                content: message,
                                            });
                                        }
                                        Err(_) => None,
                                    }
                                } else {
                                    None
                                }
                            }
                            None => None,
                        })
                        .collect::<Vec<GroupMessageData>>())
                })
            })
        });

    match result {
        Ok(data) => Ok(GroupMessageDataWrapper(
            data.into_iter().flatten().collect(),
        )),
        Err(e) => Err(e),
    }
}

pub fn indicate_group_typing(group_typing_detail_data: GroupTypingDetailData) -> ExternResult<()> {
    let signal_detail: SignalDetails = SignalDetails {
        name: SignalName::GROUP_TYPING_DETAIL.to_owned(),
        payload: SignalPayload::GroupTypingDetail(group_typing_detail_data.clone()),
    };
    remote_signal(&signal_detail, group_typing_detail_data.members)?;
    Ok(())
}

pub fn read_group_message(
    group_message_read_data: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    let my_agent_pubkey = agent_info()?.agent_latest_pubkey;
    for message_entry_hash in group_message_read_data.message_ids.clone() {
        // link GroupMessage -> AgentPubKey to indicate that it is read.
        create_link(
            message_entry_hash,
            my_agent_pubkey.clone().into(),
            LinkTag::new("read".to_owned()),
        )?;
    }
    let signal_detail = SignalDetails {
        name: SignalName::GROUP_MESSAGE_READ.to_owned(),
        payload: SignalPayload::GroupMessageRead(group_message_read_data.clone()),
    };
    remote_signal(&signal_detail, group_message_read_data.members.clone())?;
    Ok(group_message_read_data)
}
