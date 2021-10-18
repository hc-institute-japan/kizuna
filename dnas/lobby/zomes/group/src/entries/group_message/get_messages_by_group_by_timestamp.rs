use hdk::prelude::*;

use element::ElementEntry;
use std::collections::HashMap;
use timestamp::Timestamp;

use crate::utils::{error, timestamp_to_days, try_get_and_convert};

use super::GroupMessageData;
use super::{
    GroupChatFilter, GroupMessage, GroupMessageContent, GroupMessageElement, GroupMessageWithId,
    GroupMessagesOutput, PayloadType,
};

pub fn get_messages_by_group_by_timestamp_handler(
    group_chat_filter: GroupChatFilter,
) -> ExternResult<GroupMessagesOutput> {
    let path = Path::from(
        [
            group_chat_filter.clone().group_id.to_string(),
            timestamp_to_days(group_chat_filter.clone().date).to_string(),
        ]
        .join(".")
        .to_string(),
    );

    match get_links(
        path.hash()?,
        match group_chat_filter.payload_type {
            PayloadType::Text => Some(LinkTag::new("text".to_owned())),
            PayloadType::File => Some(LinkTag::new("file".to_owned())),
            PayloadType::Media => Some(LinkTag::new("media".to_owned())),
            PayloadType::All => None,
        },
    ) {
        Ok(message_links) => {
            let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
            let mut group_messages_content: HashMap<String, GroupMessageContent> = HashMap::new();
            let mut messages_hashes: Vec<EntryHash> = Vec::new();

            let links = message_links.into_inner();
            let get_input = links
                // .into_inner()
                .into_iter()
                .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
                .collect();

            let get_output = HDK.with(|h| h.borrow().get(get_input))?;

            let _get_output_result = get_output
                .into_iter()
                .filter_map(|maybe_option| maybe_option)
                .map(
                    |element| match element.entry().to_owned().to_app_option::<GroupMessage>() {
                        Ok(option) => match option {
                            Some(group_message) => {
                                let message_hash = hash_entry(group_message.clone())?;

                                let read_links = get_links(
                                    message_hash.clone(),
                                    Some(LinkTag::new("read".to_owned())),
                                )?;
                                let mut read_list: HashMap<String, Timestamp> = HashMap::new();

                                let mut timestamps = Vec::new();

                                let get_input_for_read = read_links
                                    .into_inner()
                                    .into_iter()
                                    .map(|link| {
                                        timestamps.push(link.timestamp);
                                        GetInput::new(link.target.into(), GetOptions::default())
                                    })
                                    .collect();

                                let get_output_for_read =
                                    HDK.with(|h| h.borrow().get(get_input_for_read))?;

                                let _get_output_for_read_result = get_output_for_read
                                    .into_iter()
                                    .filter_map(|maybe_option| maybe_option)
                                    .zip(timestamps)
                                    .map(|(element, timestamp)| match element.into_inner().1 {
                                        ElementEntry::Present(entry) => {
                                            if let Entry::Agent(agent_pubkey) = entry {
                                                read_list
                                                    .insert(agent_pubkey.to_string(), timestamp);
                                            }
                                        }
                                        _ => (),
                                    });

                                let mut group_message_data = GroupMessageData {
                                    message_id: message_hash.clone(),
                                    group_hash: group_message.group_hash.clone(),
                                    sender: group_message.sender.clone(),
                                    payload: group_message.payload.clone(),
                                    created: group_message.created.clone(),
                                    reply_to: None,
                                };

                                if let Some(reply_to_hash) = group_message.reply_to.clone() {
                                    let replied_message: GroupMessage = try_get_and_convert(
                                        reply_to_hash.clone(),
                                        GetOptions::content(),
                                    )?;
                                    group_message_data.reply_to = Some(GroupMessageWithId {
                                        id: reply_to_hash,
                                        content: replied_message,
                                    });
                                }

                                let group_message_element: GroupMessageElement =
                                    GroupMessageElement {
                                        entry: group_message_data,
                                        signed_header: element.signed_header().to_owned(),
                                    };

                                group_messages_content.insert(
                                    message_hash.clone().to_string(),
                                    GroupMessageContent {
                                        group_message_element,
                                        read_list: read_list,
                                    },
                                );

                                messages_hashes.push(message_hash.clone());
                                Ok(())
                            }

                            None => Ok(()),
                        },

                        Err(_) => {
                            return error(
                                "the group message ElementEntry enum is not of Present variant",
                            );
                        }
                    },
                );

            // for i in 0..links.len() {
            //     let message_link = links[i].clone();
            //     let message_hash = message_link.target;

            //     if let Some(element) = get(message_hash.clone(), GetOptions::content())? {
            //         let read_links =
            //             get_links(message_hash.clone(), Some(LinkTag::new("read".to_owned())))?;
            //         let mut read_list: HashMap<String, Timestamp> = HashMap::new();

            //         for j in 0..read_links.clone().into_inner().len() {
            //             let read_link = read_links.clone().into_inner()[j].clone();

            //             if let Some(element) = get(read_link.target, GetOptions::default())? {
            //                 if let ElementEntry::Present(entry) = element.into_inner().1 {
            //                     if let Entry::Agent(agent_pubkey) = entry {
            //                         read_list.insert(agent_pubkey.to_string(), read_link.timestamp);
            //                     };
            //                 };
            //             };
            //         }

            //         match element.entry().to_owned().to_app_option::<GroupMessage>() {
            //             Ok(option) => match option {
            //                 Some(group_message) => {
            //                     let mut group_message_data = GroupMessageData {
            //                         message_id: message_hash.clone(),
            //                         group_hash: group_message.group_hash.clone(),
            //                         sender: group_message.sender.clone(),
            //                         payload: group_message.payload.clone(),
            //                         created: group_message.created.clone(),
            //                         reply_to: None,
            //                     };

            //                     if let Some(reply_to_hash) = group_message.reply_to.clone() {
            //                         let replied_message: GroupMessage = try_get_and_convert(
            //                             reply_to_hash.clone(),
            //                             GetOptions::content(),
            //                         )?;
            //                         group_message_data.reply_to = Some(GroupMessageWithId {
            //                             id: reply_to_hash,
            //                             content: replied_message,
            //                         });
            //                     }

            //                     let group_message_element: GroupMessageElement =
            //                         GroupMessageElement {
            //                             entry: group_message_data,
            //                             signed_header: element.signed_header().to_owned(),
            //                         };

            //                     group_messages_content.insert(
            //                         message_hash.clone().to_string(),
            //                         GroupMessageContent {
            //                             group_message_element,
            //                             read_list: read_list,
            //                         },
            //                     );

            //                     messages_hashes.push(message_hash.clone());
            //                 }

            //                 None => {}
            //             },

            //             Err(_) => {
            //                 return error(
            //                     "the group message ElementEntry enum is not of Present variant",
            //                 );
            //             }
            //         }
            //     };
            // }

            messages_by_group.insert(
                group_chat_filter.clone().group_id.to_string(),
                messages_hashes,
            );

            Ok(GroupMessagesOutput {
                messages_by_group: messages_by_group,
                group_messages_contents: group_messages_content,
            })
        }
        Err(_) => error("Cannot get links on this path"),
    }
}
