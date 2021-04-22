use hdk::prelude::*;

use element::ElementEntry;
use std::collections::HashMap;
use timestamp::Timestamp;

use crate::utils::error;
use crate::utils::timestamp_to_days;

use super::{
    GroupChatFilter, GroupMessageContent, GroupMessageElement, GroupMessageHash,
    GroupMessagesContents, GroupMessagesOutput, MessagesByGroup, PayloadType, ReadList,
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
                    let mut read_list: HashMap<String, Timestamp> = HashMap::new();

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

                    match element.entry().to_owned().to_app_option() {
                        Ok(option) => match option {
                            Some(group_message) => {
                                let group_message_element: GroupMessageElement =
                                    GroupMessageElement {
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
                            }

                            None => {}
                        },

                        Err(_) => {
                            return error(
                                "the group message ElementEntry enum is not of Present variant",
                            );
                        }
                    }
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
        Err(_) => error("Cannot get links on this path"),
    }
}
