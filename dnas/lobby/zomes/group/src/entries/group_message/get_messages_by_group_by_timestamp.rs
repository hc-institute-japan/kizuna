use hdk::prelude::*;

use std::collections::HashMap;
use timestamp::Timestamp;

use crate::utils::{timestamp_to_days, try_from_element, try_get_and_convert};

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

    let message_links = get_links(
        path.path_entry_hash()?,
        match group_chat_filter.payload_type {
            PayloadType::Text => Some(LinkTag::new("text".to_owned())),
            PayloadType::File => Some(LinkTag::new("file".to_owned())),
            PayloadType::Media => Some(LinkTag::new("media".to_owned())),
            PayloadType::All => None,
        },
    )?;

    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
    let mut group_messages_content: HashMap<String, GroupMessageContent> = HashMap::new();
    let mut messages_hashes: Vec<EntryHash> = Vec::new();

    let mut all_read_list: HashMap<String, HashMap<String, Timestamp>> = HashMap::new();
    let mut read_message_hashes: Vec<EntryHash> = Vec::new();

    let links = message_links;

    // create input for getting the messages => input: Vec<(message_hash, GetOptions)
    let get_input = links
        .clone()
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::latest()))
        .collect();

    // create input for getting the read links => input: Vec<(message_hash, "read")>
    let get_input_message_hashes: Vec<GetLinksInput> = links
        .clone()
        .into_iter()
        .map(|link| {
            read_message_hashes.push(link.target.clone().into());
            all_read_list.insert(link.target.clone().to_string(), HashMap::new());
            GetLinksInput::new(link.target.into(), Some(LinkTag::new("read".to_owned())))
        })
        .collect();

    // parallel get links for all message_hash
    let read_links = HDK.with(|h| h.borrow().get_links(get_input_message_hashes))?;
    let read_links_2 = read_links.into_iter().zip(read_message_hashes);

    for (links_vec, message_hash) in read_links_2 {
        match all_read_list.get_mut(&message_hash.to_string()) {
            Some(hashmap) => {
                for link in links_vec {
                    hashmap.insert(link.target.to_string(), link.timestamp.to_owned());
                }
                ()
            }
            None => (),
        }
    }

    // parallel get messages
    let get_output = HDK.with(|h| h.borrow().get(get_input))?;
    let get_output_result: Vec<Element> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    for element in get_output_result {
        let group_message: GroupMessage = try_from_element(element.clone())?;

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
            let replied_message: GroupMessage =
                try_get_and_convert(reply_to_hash.clone(), GetOptions::latest())?;
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
                read_list: match all_read_list.get(&message_hash.clone().to_string()) {
                    Some(hashmap) => hashmap.to_owned(),
                    None => HashMap::new(),
                },
            },
        );

        messages_hashes.push(message_hash.clone());
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
