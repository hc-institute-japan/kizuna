use std::{collections::HashMap, time::SystemTime};

use element::ElementEntry;
use hdk3::prelude::*;

use crate::utils::timestamp_to_days;

use super::{
    GroupChatFilter, GroupMessage, GroupMessageContent, GroupMessageElement, GroupMessageHash,
    GroupMessagesContents, GroupMessagesOutput, MessagesByGroup, PayloadType, ReadList,
};

/*

Initial implementation of get_message_by_group_by_timestamp

Notes:
1. Would it be better to separate zome functions like this?
2. Or should we just categorize them? Like have files like "getters.rs" then put all the getters there.

*/

pub fn handler(group_chat_filter: GroupChatFilter) -> ExternResult<GroupMessagesOutput> {
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
            PayloadType::All => None,
        },
    ) {
        Ok(message_links) => {
            let mut messages_by_group: HashMap<String, Vec<GroupMessageHash>> = HashMap::new();
            let mut group_messages_content: HashMap<String, GroupMessageContent> = HashMap::new();
            let mut messages_hashes: Vec<GroupMessageHash> = Vec::new();
            let links = message_links.into_inner();

            for i in 0..links.len() {
                let message_link = links[i].clone();

                if let Some(element) = get(message_link.clone().target, GetOptions::content())? {
                    let read_links = get_links(
                        message_link.clone().target,
                        Some(LinkTag::new("read".to_owned())),
                    )?;
                    let mut read_list: HashMap<String, SystemTime> = HashMap::new();

                    for j in 0..read_links.clone().into_inner().len() {
                        let read_link = read_links.clone().into_inner()[j].clone();

                        if let Some(element) = get(read_link.target, GetOptions::default())? {
                            if let ElementEntry::Present(entry) = element.into_inner().1 {
                                if let Entry::Agent(agent_pubkey) = entry {
                                    read_list.insert(agent_pubkey.to_string(), read_link.timestamp);
                                };
                            };
                        };
                    }

                    let group_message: GroupMessage = element
                        .entry()
                        .to_owned()
                        .to_app_option::<GroupMessage>()?
                        .ok_or(HdkError::Wasm(WasmError::Zome(
                            "the group message ElementEntry enum is not of Present variant".into(),
                        )))?;
                    let group_message_element: GroupMessageElement = GroupMessageElement {
                        entry: group_message,
                        signed_header: element.signed_header().to_owned(),
                    };

                    group_messages_content.insert(
                        message_link.clone().target.to_string(),
                        GroupMessageContent {
                            group_message_element,
                            read_list: ReadList(read_list),
                        },
                    );

                    messages_hashes.push(GroupMessageHash(message_link.clone().target));
                };
            }

            messages_by_group.insert(
                group_chat_filter.clone().group_id.to_string(),
                messages_hashes,
            );

            Ok(GroupMessagesOutput {
                messages_by_group: MessagesByGroup(messages_by_group),
                group_messages_contents: GroupMessagesContents(group_messages_content),
            })
        }
        Err(_) => Err(HdkError::Wasm(WasmError::Zome(
            "Cannot get links on this path".into(),
        ))),
    }
}
