#![allow(unused_imports)]
use hdk3::{host_fn::remote_signal, prelude::*};
use link::Link;

use crate::{
    entries::group::{self, handlers::get_group_latest_version},
    utils::{collect, error, path_from_str, timestamp_to_days, to_timestamp},
};

use super::{GroupMessage, GroupMessageData, GroupMessageDataWrapper, GroupMessageInput, Payload};

pub fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
    // GroupMessage entry
    let message = GroupMessage {
        group_hash: message_input.group_hash,
        payload: message_input.payload,
        created: to_timestamp(sys_time()?),
        sender: message_input.sender,
        reply_to: message_input.reply_to,
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
                        file_name: _,
                        file_size: _,
                        file_type: _,
                        bytes: _,
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

                    remote_signal(&group_message_data, group.members)?;
                    Ok(group_message_data)
                }
                Err(_) => Err(HdkError::Wasm(WasmError::Zome(
                    "Cannot get group's latest version".into(),
                ))),
            }
        }
        Err(_) => Err(HdkError::Wasm(WasmError::Zome("Cannot create path".into()))),
    }
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
                    let stuff: Vec<GroupMessageData> = elements
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
                        .collect();
                    Ok(stuff)
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

// let mut messages = Vec::new();
// match get_links(path.hash()?, None) {
//     Ok(timestamp_links) => {
//         timestamp_links
//             .into_inner()
//             .into_iter()
//             .for_each(|timestamp_link| {
//                 match get_links(timestamp_link.target, None) {
//                     Ok(message_links) => {
//                         message_links
//                             .into_inner()
//                             .into_iter()
//                             .for_each(|message_link| {
//                                 match get(message_link.target, GetOptions::default()) {
//                                     Ok(e) => {
//                                         match e.ok_or("test".to_string()) {
//                                             Ok(entry) => {
//                                                 match entry
//                                                     .entry()
//                                                     .to_app_option::<GroupMessage>()
//                                                 {
//                                                     Ok(e) => {
//                                                         let group_message = e.unwrap();
//                                                         match hash_entry(&group_message) {
//                                                             Ok(hash) => {
//                                                                 messages.push(
//                                                                     GroupMessageData {
//                                                                         id: hash,
//                                                                         content: group_message,
//                                                                     },
//                                                                 );
//                                                             }
//                                                             Err(_) => {}
//                                                         }
//                                                     }
//                                                     Err(_) => {}
//                                                 };
//                                             }
//                                             Err(_) => {}
//                                         };
//                                     }
//                                     Err(_) => {}
//                                 };
//                             });
//                     }
//                     Err(_) => {}
//                 };
//             });
//     }
//     Err(_) => {}
// };
