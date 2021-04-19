use crate::utils::collect;
use hdk::prelude::*;

use super::{GroupMessage, GroupMessageData, GroupMessageDataWrapper};

pub fn get_all_messages_handler(group_hash: EntryHash) -> ExternResult<GroupMessageDataWrapper> {
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
