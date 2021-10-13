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
    let mut subsequent_messages_hashes: Vec<EntryHash> = Vec::new();
    let mut previous_messages_hashes: Vec<EntryHash> = Vec::new();
    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
    let mut group_messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    // links to group message where link.timestamp < filter.message_timestamp
    let mut previous_linked_messages: Vec<Link> = Vec::new();
    // links to group message where link.timesatmp > filter.message_timestamp
    let mut subsequent_linked_messages: Vec<Link> = Vec::new();

    let days: String = timestamp_to_days(filter.message_timestamp.clone()).to_string();
    let pivot_path_hash =
        path_from_str(&[filter.group_id.clone().to_string(), days].join(".")).hash()?;

    // targets are group message entryhash
    let mut linked_messages = get_linked_messages_from_path(
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

    /*
      collect message info for links where link.timestamp < filter.message_timestamp
      for the group messages linked to a specific path constructed above in the first call
      and link.timestamp > filter.message_timestamp in the second call to collect_message_info()
    */
    collect_messages_info(
        &mut previous_linked_messages,
        filter.batch_size.clone().into(),
        &mut previous_messages_hashes,
        &mut group_messages_contents,
        Direction::Previous,
    )?;

    collect_messages_info(
        &mut subsequent_linked_messages,
        filter.batch_size.clone().into(),
        &mut subsequent_messages_hashes,
        &mut group_messages_contents,
        Direction::Subsequent,
    )?;

    // construct the group id path which has all the unix timestamp paths as children
    let group_path = path_from_str(&filter.group_id.to_string());
    // This is so that we don't get the children paths just in case it is gathered in the first loop
    let mut maybe_children_paths: Option<Vec<Link>> = None;

    // check if we gathered enough previous messages and if not collect more
    if previous_messages_hashes.len() < filter.batch_size.into() {
        let mut children_paths = group_path.children()?.into_inner();
        // for later use in the subsequent loop
        maybe_children_paths = Some(children_paths.clone());

        // remove the paths that are newer than the pivot path
        filter_path_children(
            &mut children_paths,
            Some(pivot_path_hash.clone()),
            Direction::Previous,
        )?;

        while !children_paths.is_empty()
            && previous_messages_hashes.len() < filter.batch_size.clone().into()
        {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // unwrap is safe here (checked that the vector wasnt empty before this)
            previous_linked_messages =
                get_linked_messages_from_path(path_hash, file_types::PayloadType::All, None, None)?;

            collect_messages_info(
                &mut previous_linked_messages,
                filter.batch_size.clone().into(),
                &mut previous_messages_hashes,
                &mut group_messages_contents,
                Direction::Previous,
            )?;
        }
    }

    // check if we gathered enough subsequent messages and if not collect more
    if subsequent_messages_hashes.len() < filter.batch_size.into() {
        let mut children_paths: Vec<Link>;
        if let Some(links) = maybe_children_paths {
            children_paths = links;
        } else {
            children_paths = group_path.children()?.into_inner();
        }
        // remove the paths that are older than the pivot path
        filter_path_children(
            &mut children_paths,
            Some(pivot_path_hash.clone()),
            Direction::Subsequent,
        )?;

        while !children_paths.is_empty()
            && previous_messages_hashes.len() < filter.batch_size.clone().into()
        {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // unwrap is safe here (checked that the vector wasnt empty before this)
            subsequent_linked_messages =
                get_linked_messages_from_path(path_hash, file_types::PayloadType::All, None, None)?;

            collect_messages_info(
                &mut subsequent_linked_messages,
                filter.batch_size.clone().into(),
                &mut subsequent_messages_hashes,
                &mut group_messages_contents,
                Direction::Subsequent,
            )?;
        }
    }

    messages_hashes.append(&mut previous_messages_hashes);
    messages_hashes.append(&mut subsequent_messages_hashes);

    messages_by_group.insert(filter.group_id.to_string(), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group: messages_by_group,
        group_messages_contents: group_messages_contents,
    })
}
