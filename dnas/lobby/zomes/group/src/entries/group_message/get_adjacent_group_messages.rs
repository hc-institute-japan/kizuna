use hdk::prelude::*;
use std::collections::HashMap;

use super::group_message_helpers::*;
use super::{GroupMessageContent, GroupMessagesOutput, GroupMsgAdjacentFetchFilter};
use crate::utils::*;

pub fn get_adjacent_group_messages_handler(
    filter: GroupMsgAdjacentFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    // We need the previous and subsequent vec for counting of batch size
    let mut messages_hashes: Vec<EntryHash> = Vec::new();
    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
    let mut group_messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    // links to group message where link.timestamp < filter.message_timestamp
    let mut previous_linked_messages: Vec<Link> = Vec::new();
    // links to group message where link.timesatmp > filter.message_timestamp
    let mut subsequent_linked_messages: Vec<Link> = Vec::new();

    let days: String = timestamp_to_days(filter.message_timestamp.clone()).to_string();
    let pivot_path_hash =
        path_from_str(&[filter.group_id.clone().to_string(), days].join("."))?.path_entry_hash()?;

    // targets are group message entryhash
    let mut linked_messages = get_linked_messages_hash(
        pivot_path_hash.clone(),
        file_types::PayloadType::All,
        None,
        None,
    )?;

    // index of the adjacent message entry hash in the vec of links
    let pivot_index = linked_messages
        .clone()
        .into_iter()
        .position(|e| e.target.eq(&filter.adjacent_message));

    if let Some(i) = pivot_index {
        // drain the group message entryhash that has timestamp previous to the adjacent message's and push
        linked_messages
            .drain(0..i)
            .into_iter()
            .for_each(|link| previous_linked_messages.push(link));

        // we then drain the rest of the links including the link for adjacent message
        linked_messages
            .drain(0..)
            .into_iter()
            .for_each(|link| subsequent_linked_messages.push(link));
    }

    // construct the group id path which has all the unix timestamp paths as children
    let group_path = path_from_str(&filter.group_id.to_string())?;
    // This is so that we don't get the children paths just in case it is gathered in the first loop
    let mut maybe_children_paths: Option<Vec<Link>> = None;

    // check if we gathered enough previous messages and if not collect more
    if previous_linked_messages.len() < filter.batch_size.into() {
        let mut children_paths = group_path.children()?;
        // for later use in the subsequent loop
        maybe_children_paths = Some(children_paths.clone());

        // remove the paths that are newer than the pivot path
        filter_path_children(
            &mut children_paths,
            Some(pivot_path_hash.clone()),
            Direction::Previous,
        )?;

        while !children_paths.is_empty()
            && previous_linked_messages.len() < filter.batch_size.clone().into()
        {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // unwrap is safe here (checked that the vector wasnt empty before this)
            let mut new_links =
                get_linked_messages_hash(path_hash, file_types::PayloadType::All, None, None)?;
            previous_linked_messages.append(&mut new_links);
        }
    }

    // check if we gathered enough subsequent linked messages and if not collect more
    if subsequent_linked_messages.len() < filter.batch_size.into() {
        let mut children_paths: Vec<Link>;
        if let Some(links) = maybe_children_paths {
            children_paths = links;
        } else {
            children_paths = group_path.children()?;
        }
        // remove the paths that are older than the pivot path
        filter_path_children(
            &mut children_paths,
            Some(pivot_path_hash.clone()),
            Direction::Subsequent,
        )?;

        while !children_paths.is_empty()
            && subsequent_linked_messages.len() < filter.batch_size.clone().into()
        {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // unwrap is safe here (checked that the vector wasnt empty before this)
            let mut new_links =
                get_linked_messages_hash(path_hash, file_types::PayloadType::All, None, None)?;
            subsequent_linked_messages.append(&mut new_links)
        }
    }

    // truncate any excess number of links we retrieved
    previous_linked_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    subsequent_linked_messages.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
    previous_linked_messages.truncate(filter.batch_size.into());
    subsequent_linked_messages.truncate(filter.batch_size.into());
    subsequent_linked_messages.append(&mut previous_linked_messages);
    linked_messages = subsequent_linked_messages;

    // finally retrieve the messages from all links gathered
    collect_and_insert_messages(
        linked_messages,
        &mut messages_hashes,
        &mut group_messages_contents,
    )?;

    // and the read_list
    collect_and_insert_read_list(&mut group_messages_contents)?;

    messages_by_group.insert(filter.group_id.to_string(), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group: messages_by_group,
        group_messages_contents: group_messages_contents,
    })
}
