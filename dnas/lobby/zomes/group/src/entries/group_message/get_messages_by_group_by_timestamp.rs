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

            let mut all_read_list: HashMap<String, HashMap<String, Timestamp>> = HashMap::new();
            let mut message_hashes_for_read = Vec::new();
            let mut timestamps = Vec::new();

            let links = message_links.into_inner();

            // create input for getting the messages => input: Vec<(message_hash, GetOptions)
            let get_input = links
                .clone()
                .into_iter()
                .map(|link| GetInput::new(link.target.into(), GetOptions::content()))
                .collect();

            // parallel get messages
            let get_output = HDK.with(|h| h.borrow().get(get_input))?;
            let get_output_result: Vec<Element> = get_output
                .into_iter()
                .filter_map(|maybe_option| maybe_option)
                .collect();

            // create input for getting the read links => input: Vec<(message_hash, "read")>
            let get_input_message_hashes: Vec<GetLinksInput> = links
                .clone()
                .into_iter()
                .map(|link| {
                    GetLinksInput::new(link.target.into(), Some(LinkTag::new("read".to_owned())))
                })
                .collect();

            // parallel get links
            let read_links: Vec<Link> = HDK
                .with(|h| h.borrow().get_links(get_input_message_hashes))?
                .into_iter()
                .map(|links| links.into_inner())
                .flatten()
                .collect();

            let get_input_for_read: Vec<GetInput> = read_links
                .into_iter()
                .map(|link| {
                    timestamps.push(link.timestamp);
                    let message_hash: EntryHash = link.target.clone().into();
                    message_hashes_for_read.push(message_hash);
                    GetInput::new(link.target.into(), GetOptions::content())
                })
                .collect();

            let get_output_for_read = HDK.with(|h| h.borrow().get(get_input_for_read))?;

            let zipped: Vec<((Element, EntryHash), Timestamp)> = get_output_for_read
                .into_iter()
                .zip(message_hashes_for_read)
                .zip(timestamps)
                .filter_map(|((element_maybe_option, message_hash), timestamp)| {
                    match element_maybe_option {
                        Some(element) => {
                            return Some(((element, message_hash), timestamp.to_owned()))
                        }
                        None => return None,
                    }
                })
                .collect();

            for ((element, message_hash), timestamp) in zipped.into_iter() {
                match element.into_inner().1 {
                    ElementEntry::Present(entry) => {
                        if let Entry::Agent(agent_pubkey) = entry {
                            match all_read_list.get_mut(&message_hash.clone().to_string()) {
                                Some(hashmap) => {
                                    hashmap.insert(
                                        agent_pubkey.clone().to_string(),
                                        timestamp.to_owned(),
                                    );
                                    ()
                                }
                                None => {
                                    let mut new = HashMap::new();
                                    new.insert(
                                        agent_pubkey.clone().to_string(),
                                        timestamp.to_owned(),
                                    );
                                    all_read_list.insert(message_hash.clone().to_string(), new);
                                    ()
                                }
                            };
                        }
                    }
                    _ => (),
                };
            }

            for element in get_output_result {
                match element.entry().to_owned().to_app_option::<GroupMessage>() {
                    Ok(option) => match option {
                        Some(group_message) => {
                            let message_hash = hash_entry(group_message.clone())?;

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

                            let group_message_element: GroupMessageElement = GroupMessageElement {
                                entry: group_message_data,
                                signed_header: element.signed_header().to_owned(),
                            };

                            group_messages_content.insert(
                                message_hash.clone().to_string(),
                                GroupMessageContent {
                                    group_message_element,
                                    // read_list: read_list,
                                    read_list: match all_read_list
                                        .get(&message_hash.clone().to_string())
                                    {
                                        Some(hashmap) => hashmap.to_owned(),
                                        None => HashMap::new(),
                                    },
                                },
                            );

                            messages_hashes.push(message_hash.clone());
                        }
                        None => (),
                    },

                    Err(_) => {
                        return error(
                            "the group message ElementEntry enum is not of Present variant",
                        );
                    }
                };
            }

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
