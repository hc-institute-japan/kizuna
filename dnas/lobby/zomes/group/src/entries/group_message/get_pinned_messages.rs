use hdk::prelude::*;
use std::collections::HashMap;

use super::{GroupMessage, GroupMessageData, GroupMessageElement, GroupMessageWithId};
use crate::utils::{try_get_and_convert, try_get_and_convert_with_header};

pub fn get_pinned_messages_handler(
    group_hash: EntryHash,
) -> ExternResult<HashMap<String, GroupMessageElement>> {
    let mut pin_contents: HashMap<String, GroupMessageElement> = HashMap::new();

    // the target of the link being the group message
    let links = get_links(group_hash, Some(LinkTag::new("pinned".to_owned())))?.into_inner();

    for link in links {
        // We try to hit the cache with content() before reaching the network
        let pinned_message_element: (SignedHeaderHashed, GroupMessage) =
            try_get_and_convert_with_header(link.target.clone(), GetOptions::content())?;
        let pinned_message_header: SignedHeaderHashed = pinned_message_element.0;
        let pinned_message: GroupMessage = pinned_message_element.1;

        let mut group_message_data = GroupMessageData {
            message_id: link.target.clone(),
            group_hash: pinned_message.group_hash.clone(),
            sender: pinned_message.sender.clone(),
            payload: pinned_message.payload.clone(),
            created: pinned_message.created.clone(),
            reply_to: None,
        };

        if let Some(reply_to_hash) = pinned_message.reply_to.clone() {
            let replied_message: GroupMessage =
                try_get_and_convert(reply_to_hash.clone(), GetOptions::content())?;
            group_message_data.reply_to = Some(GroupMessageWithId {
                id: reply_to_hash,
                content: replied_message,
            });
        }

        let group_message_element: GroupMessageElement = GroupMessageElement {
            entry: group_message_data,
            signed_header: pinned_message_header,
        };

        pin_contents.insert(link.target.clone().to_string(), group_message_element);
    }

    Ok(pin_contents)
}
