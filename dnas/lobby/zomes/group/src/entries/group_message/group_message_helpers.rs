use hdk::prelude::*;

use crate::utils::{error, try_from_element_with_header, try_get_and_convert};

use file_types::PayloadType;
use std::collections::hash_map::HashMap;

use super::{
    GroupMessage, GroupMessageContent, GroupMessageData, GroupMessageElement, GroupMessageWithId,
};

pub enum Direction {
    Previous,
    Subsequent,
}

pub fn get_linked_messages_hash(
    path_hash: EntryHash,
    payload_type: PayloadType,
    last_fetched: Option<EntryHash>,
    direction: Option<Direction>,
) -> ExternResult<Vec<Link>> {
    // this method return the messages linked to the path, if the args given have a last_fetched then this method will filter the linked messages and will remove those links newest than the last_fecthed

    let mut linked_messages: Vec<Link>;

    match payload_type {
        PayloadType::Text => {
            // linked_messages = get_links(path_hash, Some(LinkTag::new("text")))?.into_inner();
            linked_messages = get_links(path_hash, Some(LinkTag::new("text")))?;
        }
        PayloadType::File => {
            // linked_messages = get_links(path_hash, Some(LinkTag::new("file")))?.into_inner();
            linked_messages = get_links(path_hash, Some(LinkTag::new("file")))?;
        }
        PayloadType::Media => {
            // linked_messages = get_links(path_hash, Some(LinkTag::new("media")))?.into_inner();
            linked_messages = get_links(path_hash, Some(LinkTag::new("media")))?;
        }
        PayloadType::All => {
            // linked_messages = get_links(path_hash, None)?.into_inner();
            linked_messages = get_links(path_hash, None)?;
        }
    }

    linked_messages.sort_by_key(|link| link.timestamp);

    if let Some(last_fetched_entry_hash) = last_fetched {
        if let Some(pivot_index) = linked_messages
            .clone()
            .into_iter()
            .position(|link| link.target.eq(&last_fetched_entry_hash))
        {
            if let Some(direction) = direction {
                match direction {
                    Direction::Previous => {
                        // remove the links that have newer timestamps than the pivot
                        linked_messages.truncate(pivot_index);
                    }
                    Direction::Subsequent => {
                        let split_index = pivot_index + 1;
                        // get the links that have older timestamps than the pivot
                        let subsequent_links: Vec<Link> = linked_messages.split_off(split_index);
                        linked_messages = subsequent_links
                    }
                }
            }
        }
    }

    return Ok(linked_messages);
}

pub fn collect_and_insert_messages(
    linked_messages: Vec<Link>,
    messages_hashes: &mut Vec<EntryHash>,
    group_messages_contents: &mut HashMap<String, GroupMessageContent>,
) -> ExternResult<()> {
    // collect values to fill the group_message_content.
    // - message entry_hash (aka link target)
    // - GroupMessageData (constructed from the element fetched from entry hash of the message )

    let message_hashes: Vec<EntryHash> = linked_messages
        .into_iter()
        .map(|link| link.target)
        .collect();
    let get_input = message_hashes
        .into_iter()
        .map(|eh| GetInput::new(eh.clone().into(), GetOptions::content()))
        .collect::<Vec<GetInput>>();

    // TODO: add a debugger here to solve the "Entry Not Found" error
    let get_output = HDK.with(|h| h.borrow().get(get_input))?;
    let messages_with_header: Vec<(SignedHeaderHashed, GroupMessage)> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .map(|e| match try_from_element_with_header::<GroupMessage>(e) {
            Ok(res) => Some(res),
            _ => None,
        })
        .filter_map(|maybe_message| maybe_message)
        .collect();

    for message_with_header in messages_with_header {
        let message = message_with_header.1;
        let signed_header = message_with_header.0;
        let message_hash = signed_header.header().entry_hash().unwrap(); // safely unwraps as all headers here are of create variant
        let mut group_message_data = GroupMessageData {
            message_id: message_hash.clone(),
            group_hash: message.group_hash.clone(),
            sender: message.sender.clone(),
            payload: message.payload.clone(),
            created: message.created.clone(),
            reply_to: None,
        };

        // TODO: refactor to be a multi get
        if let Some(reply_to_hash) = message.reply_to.clone() {
            let replied_message: GroupMessage =
                try_get_and_convert(reply_to_hash.clone(), GetOptions::content())?;
            group_message_data.reply_to = Some(GroupMessageWithId {
                id: reply_to_hash,
                content: replied_message,
            });
        }

        let group_message_element: GroupMessageElement = GroupMessageElement {
            entry: group_message_data,
            signed_header: signed_header.clone(),
        };

        group_messages_contents.insert(
            message_hash.clone().to_string(),
            GroupMessageContent {
                group_message_element,
                read_list: HashMap::new(), // read list will be collected in a separate helper
            },
        );
        messages_hashes.push(message_hash.clone());
    }

    Ok(())
}

pub fn collect_and_insert_read_list(
    group_messages_contents: &mut HashMap<String, GroupMessageContent>,
) -> ExternResult<()> {
    let mut all_read_list: HashMap<String, HashMap<String, Timestamp>> = HashMap::new();

    let message_hashes = group_messages_contents
        .values()
        .map(|msg| msg.group_message_element.entry.message_id.clone())
        .collect::<Vec<EntryHash>>();

    // create input for getting the read links => input: Vec<(message_hash, "read")>
    let get_input_message_hashes: Vec<GetLinksInput> = message_hashes
        .clone()
        .into_iter()
        .map(|eh| {
            all_read_list.insert(eh.clone().to_string(), HashMap::new());
            GetLinksInput::new(eh.into(), Some(LinkTag::new("read".to_owned())))
        })
        .collect();

    // parallel get links for all message_hash
    let read_links = HDK.with(|h| h.borrow().get_links(get_input_message_hashes))?;
    let read_links_with_message_hash = read_links
        .into_iter()
        // .map(|links| links.into_inner())
        .zip(message_hashes);

    for (links_vec, message_hash) in read_links_with_message_hash {
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

    for (message_hash, read_list) in all_read_list {
        match group_messages_contents.get_mut(&message_hash) {
            Some(message) => message.read_list = read_list,
            None => (),
        }
    }

    Ok(())
}

pub fn filter_path_children(
    children_paths: &mut Vec<Link>,
    pivot_path: Option<EntryHash>,
    direction: Direction,
) -> ExternResult<()> {
    //->Vec<Link>

    // the pivot path only be a Some(_) if we already collect messages in one path before this called happens in other words if we received the fields last_fecthed and last_message_timestamp as Some(_)
    children_paths.sort_by_key(|link| link.timestamp);

    if let Some(path_hash) = pivot_path {
        if let Some(pivot_index) = children_paths
            .clone()
            .into_iter()
            .position(|link| link.target.eq(&path_hash))
        {
            match direction {
                Direction::Previous => {
                    // remove the paths that have newer timestamps than the pivot
                    children_paths.truncate(pivot_index);
                }
                Direction::Subsequent => {
                    let split_index = pivot_index + 1;
                    let subsequent_paths: Vec<Link> = children_paths.split_off(split_index);
                    *children_paths = subsequent_paths
                }
            }
        } else {
            // this case shouldnt happen but we will handle it as an error (we can modified this in the future)
            return error("cannot find this pivot into the childrens list ");
        }
    }

    Ok(())
}
