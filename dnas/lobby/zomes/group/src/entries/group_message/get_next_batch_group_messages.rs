use hdk::prelude::*;
use crate::utils::*;
use file_types::PayloadType;
use std::collections::hash_map::HashMap;

use super::group_message_helpers::collect_messages_info;
use super::group_message_helpers::filter_path_children_list;
use super::group_message_helpers::get_linked_messages_from_path;

use super::{GroupMessageContent, GroupMessageHash, GroupMessagesOutput, GroupMsgBatchFetchFilter, GroupMessagesContents, MessagesByGroup};


pub fn get_next_batch_group_messages_handler(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    let group_id: EntryHash = filter.group_id;
    let last_fetched: Option<EntryHash> = filter.last_fetched;
    let last_message_timestamp: Option<Timestamp> = filter.last_message_timestamp;
    let batch_size: usize = filter.batch_size.into();
    let payload_type: PayloadType = filter.payload_type;

    let mut linked_messages: Vec<Link>;

    let mut messages_hashes: Vec<GroupMessageHash> = vec![];
    let mut messages_by_group: HashMap<String, Vec<GroupMessageHash>> = HashMap::new(); // not used yet
    let mut group_messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    let mut pivot_path: Option<EntryHash> = None; // this variable wiil be used if we dont reach the batch_size from the first path evaluated.

    if last_fetched.is_some() && last_message_timestamp.is_some() {
        // 1 - generate the especific path

        let days: String = timestamp_to_days(last_message_timestamp.clone().unwrap()).to_string();

        match path_from_str(&[group_id.clone().to_string(), days].join(".")).hash() {
            Ok(path_hash) => {
                pivot_path = Some(path_hash.clone());

                // get the messages linked to this path (this list was sorted & filter inside the method )
                linked_messages = get_linked_messages_from_path(
                    path_hash,
                    payload_type.clone(),
                    last_fetched.clone(),
                )?;

                // we will collect the messages and all the info we need of then using this function
                collect_messages_info(
                    &mut linked_messages, // the linked message list contains all the messages linked to one especific path
                    batch_size.clone(),
                    &mut messages_hashes,
                    &mut group_messages_contents,
                )?;
            }
            Err(_) => {
                // when this error can be generated? get the hash for a given entry should be safe
                return error("Cannot get the path hash");
            }
        }
    }

    // here we have to check if we already reach the batch size or not (if we dont reached yet the batch size we will repeat the proccess this time we will get all the pahs instead the especific one )

    if messages_hashes.len() < batch_size {
        //generate the general group path (only the group_id)
        let group_path: Path = path_from_str(&group_id.to_string());

        // get the list of childrens for this path
        let mut path_childrens: Vec<Link> = group_path.children()?.into_inner();

        // filter this childrens to removed the path we dont need to check
        filter_path_children_list(&mut path_childrens, pivot_path)?;

        //itarate the childrens untill we reach the batch size or we run out of paths

        loop {
            if path_childrens.is_empty() || messages_hashes.len() >= batch_size {
                break;
            }

            let path_hash: EntryHash = path_childrens.pop().unwrap().target; // this unwrap is safe (we check the vector wasnt empty before this)

            // get the messages linked to this path (this list was sorted & filter inside the method )
            linked_messages = get_linked_messages_from_path(path_hash, payload_type.clone(), None)?; // here by default we have to send a None

            collect_messages_info(
                &mut linked_messages, // the linked message list contains all the messages linked to one especific path
                batch_size.clone(),
                &mut messages_hashes,
                &mut group_messages_contents,
            )?;
        }
    }

    // at this point we have all the data we need to returned to the ui
    messages_by_group.insert(group_id.to_string(), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group: MessagesByGroup(messages_by_group),
        group_messages_contents: GroupMessagesContents(group_messages_contents),
    })
}
