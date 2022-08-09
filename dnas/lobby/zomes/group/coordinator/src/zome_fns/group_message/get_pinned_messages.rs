use group_integrity::LinkTypes;
use hdk::prelude::*;
use std::collections::HashMap;

use crate::utils::{try_get_and_convert, try_get_and_convert_with_action};
use group_coordinator_types::group_message::{
    GroupMessageData, GroupMessageRecord, GroupMessageWithId,
};
use group_integrity_types::GroupMessage;

pub fn get_pinned_messages_handler(
    group_hash: EntryHash,
) -> ExternResult<HashMap<String, GroupMessageRecord>> {
    let mut pin_contents: HashMap<String, GroupMessageRecord> = HashMap::new();

    // the target of the link being the group message
    let links = get_links(
        group_hash,
        LinkTypes::GroupToGroupMessage,
        Some(LinkTag::new("pinned".to_owned())),
    )?;

    for link in links {
        // We try to hit the cache with content() before reaching the network
        let pinned_message_record: (SignedActionHashed, GroupMessage) =
            try_get_and_convert_with_action(link.target.clone().into(), GetOptions::latest())?;
        let pinned_message_action: SignedActionHashed = pinned_message_record.0;
        let pinned_message: GroupMessage = pinned_message_record.1;

        let mut group_message_data = GroupMessageData {
            message_id: link.target.clone().into(),
            group_hash: pinned_message.group_hash.clone(),
            sender: pinned_message.sender.clone(),
            payload: pinned_message.payload.clone(),
            created: pinned_message.created.clone(),
            reply_to: None,
        };

        if let Some(reply_to_hash) = pinned_message.reply_to.clone() {
            let replied_message: GroupMessage =
                try_get_and_convert(reply_to_hash.clone(), GetOptions::latest())?;
            group_message_data.reply_to = Some(GroupMessageWithId {
                id: reply_to_hash,
                content: replied_message,
            });
        }

        let group_message_record: GroupMessageRecord = GroupMessageRecord {
            entry: group_message_data,
            signed_action: pinned_message_action,
        };

        pin_contents.insert(link.target.clone().to_string(), group_message_record);
    }

    Ok(pin_contents)
}
