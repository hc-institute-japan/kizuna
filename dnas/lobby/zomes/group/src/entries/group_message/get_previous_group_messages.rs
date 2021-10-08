use crate::utils::*;
use hdk::prelude::*;
use std::collections::hash_map::HashMap;

use super::group_message_helpers::*;

use super::{GroupMessageContent, GroupMessagesOutput, GroupMsgBatchFetchFilter};

pub fn get_previous_group_messages_handler(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    let mut linked_messages: Vec<Link>;

    let mut messages_hashes: Vec<EntryHash> = vec![];
    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();
    let mut group_messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    let mut pivot_path: Option<EntryHash> = None; // this variable wiil be used if we dont reach the batch_size from the first path evaluated.

    if filter.last_fetched.is_some() && filter.last_message_timestamp.is_some() {
        // 1 - generate the especific path

        let days: String =
            timestamp_to_days(filter.last_message_timestamp.clone().unwrap()).to_string();

        let path_hash =
            path_from_str(&[filter.group_id.clone().to_string(), days].join(".")).hash()?;
        pivot_path = Some(path_hash.clone());

        // get the messages linked to this path (this list was sorted & filtered inside the method)
        linked_messages = get_linked_messages_from_path(
            path_hash,
            filter.payload_type.clone(),
            filter.last_fetched.clone(),
            Some(Direction::Previous),
        )?;

        // we will collect the messages and all the info we need of then using this function
        collect_messages_info(
            &mut linked_messages, // the linked message list contains all the messages linked to one especific path
            filter.batch_size.clone().into(),
            &mut messages_hashes,
            &mut group_messages_contents,
            Direction::Previous,
        )?;
    }

    // here we have to check if we already reach the batch size or not (if we dont reached yet the batch size we will repeat the proccess this time we will get all the pahs instead the especific one )

    if messages_hashes.len() < filter.batch_size.into() {
        // generate the general group path (only the group_id)
        let group_path: Path = path_from_str(&filter.group_id.to_string());

        // get the list of childrens for this path
        let mut children_paths: Vec<Link> = group_path.children()?.into_inner();

        // filter this childrens to removed the path we dont need to check
        filter_path_children(&mut children_paths, pivot_path, Direction::Previous)?;

        // iterate the childrens until we reach the batch size or we run out of paths
        while !children_paths.is_empty() && messages_hashes.len() < filter.batch_size.into() {
            let path_hash: EntryHash = children_paths.pop().unwrap().target; // this unwrap is safe (we check the vector wasnt empty before this)

            // get the messages linked to this path (this list was sorted & filter inside the method )
            linked_messages =
                get_linked_messages_from_path(path_hash, filter.payload_type.clone(), None, None)?;

            collect_messages_info(
                &mut linked_messages, // the linked message list contains all the messages linked to one especific path
                filter.batch_size.clone().into(),
                &mut messages_hashes,
                &mut group_messages_contents,
                Direction::Previous,
            )?;
        }
    }

    // at this point we have all the data we need to returned to the ui
    messages_by_group.insert(filter.group_id.to_string(), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group: messages_by_group,
        group_messages_contents: group_messages_contents,
    })
}
