use crate::utils::*;
use hdk::prelude::*;
use std::collections::hash_map::HashMap;

use super::group_message_helpers::*;

use super::{GroupMessageContent, GroupMessagesOutput, GroupMsgBatchFetchFilter};

pub fn get_previous_group_messages_handler(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    let mut linked_messages: Vec<Link> = Vec::default();

    let mut messages_hashes: Vec<EntryHash> = vec![];
    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
    let mut group_messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    let mut pivot_path: Option<EntryHash> = None; // this variable wiil be used if we dont reach the batch_size from the first path evaluated.

    if filter.last_fetched.is_some() && filter.last_message_timestamp.is_some() {
        // 1 - generate the especific path

        let days: String =
            timestamp_to_days(filter.last_message_timestamp.clone().unwrap()).to_string();

        let path_hash = path_from_str(&[filter.group_id.clone().to_string(), days].join("."))?
            .path_entry_hash()?;
        pivot_path = Some(path_hash.clone());

        // get the messages linked to this path (this list was sorted & filtered inside the method)
        linked_messages = get_linked_messages_hash(
            path_hash,
            filter.payload_type.clone(),
            filter.last_fetched.clone(),
            Some(Direction::Previous),
        )?;
    }

    // check whether batch size is reached and collect some more messages if not
    if linked_messages.len() < filter.batch_size.into() {
        // generate the group path
        let group_path: Path = path_from_str(&filter.group_id.to_string())?;

        // get the list of childrens for this path
        let mut children_paths: Vec<Link> = group_path.children()?;

        // remove the path we dont need to check
        filter_path_children(&mut children_paths, pivot_path, Direction::Previous)?;

        // iterate the childrens until we reach the batch size or we run out of paths
        while !children_paths.is_empty() && linked_messages.len() < filter.batch_size.into() {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // safely unwrap as we checked for emptiness above

            let mut new_links =
                get_linked_messages_hash(path_hash, filter.payload_type.clone(), None, None)?;
            linked_messages.append(&mut new_links);
        }
    }

    // remove excess links
    linked_messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    linked_messages.truncate(filter.batch_size.into());

    // finally retrieve the messages from all links gathered
    collect_and_insert_messages(
        linked_messages,
        &mut messages_hashes,
        &mut group_messages_contents,
    )?;

    // and the read_list
    collect_and_insert_read_list(&mut group_messages_contents)?;

    let hashes_in_contents: Vec<String> = group_messages_contents.clone().into_keys().collect();
    let messages_hashes_string: Vec<String> = messages_hashes
        .clone()
        .into_iter()
        .map(|eh| eh.to_string())
        .collect();
    let difference: Vec<String> = messages_hashes_string
        .into_iter()
        .filter(|item| !hashes_in_contents.contains(item))
        .collect();
    debug!("here are the unfetched messages {:?}", difference);

    // TODO: remove this once the bug in holochain is fixed where the author of the entry
    // can fetch the entry but other agents cannot.
    messages_hashes.retain(|eh| {
        let string_hash = eh.to_string();
        return !difference.contains(&string_hash);
    });
    messages_by_group.insert(filter.group_id.to_string(), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group,
        group_messages_contents,
    })
}
