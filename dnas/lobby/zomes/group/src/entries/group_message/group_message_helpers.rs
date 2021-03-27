use hdk::prelude::*;

use crate::utils::error;
use file_types::PayloadType;
use std::collections::hash_map::HashMap;

use super::{
    GroupMessageContent,
    GroupMessageElement,
    GroupMessageHash,
    ReadList
};


pub fn get_linked_messages_from_path( path_hash: EntryHash, payload_type: PayloadType, last_fetched: Option<EntryHash> ) -> ExternResult<Vec<Link>> {
    // this method return the messages linked to the path, if the args given have a last_fetched then this method will filter the linked messages and will remove those links newest than the last_fecthed

    let mut linked_messages: Vec<Link>;

    match payload_type {
        PayloadType::Text => {
            linked_messages = get_links(path_hash, Some(LinkTag::new("text")))?.into_inner();
        }
        PayloadType::File => {
            linked_messages = get_links(path_hash, Some(LinkTag::new("file")))?.into_inner();
        }
        PayloadType::All => {
            linked_messages = get_links(path_hash, None)?.into_inner();
        }
    }

    linked_messages.sort_by_key(|link| link.timestamp);

    if let Some(last_fetched_entry_hash) = last_fetched {
        if let Some(pivot) = linked_messages
            .clone()
            .into_iter()
            .position(|link| link.target.eq(&last_fetched_entry_hash))
        {
            linked_messages.truncate(pivot);
        }
    }

    return Ok(linked_messages);
}

pub fn collect_messages_info( linked_messages: &mut Vec<Link>, batch_size: usize, messages_hashes: &mut Vec<GroupMessageHash>, group_messages_contents: &mut HashMap<String, GroupMessageContent>) -> ExternResult<()> {
    let mut read_list: HashMap<String, Timestamp> = HashMap::new();

    loop {
        if linked_messages.is_empty() || messages_hashes.len() >= batch_size {
            break;
        }

        let link: Link = linked_messages.pop().unwrap();

        if let Some(message_element) = get(link.target.clone(), GetOptions::content())? {
            // here i collect all the values to fill the group_message_content this values are:

            // - the message entry_hash (aka the link target )
            // - the GroupMessageData (constructed from the element fetched from entry hash of the message )
            // - the read_list for that message ( got it from the links related to the message with the tag "read" )

            let read_links: Vec<Link> =
                get_links(link.target.clone(), Some(LinkTag::new("read")))?.into_inner();

            for link in read_links {
                read_list.insert(link.target.to_string(), link.timestamp);
            }

            match message_element.entry().to_app_option(){

                Ok(option) =>{
                    match option {
                        Some(group_message) => {

                            let group_message_element: GroupMessageElement = GroupMessageElement {
                                entry: group_message,
                                signed_header: message_element.signed_header().to_owned(),
                            };
                
                            group_messages_contents.insert(
                                link.target.clone().to_string(),
                                GroupMessageContent {
                                    group_message_element,
                                    read_list: ReadList(read_list.clone()),
                                },
                            );
                
                            read_list.clear();
                        }, 
                        None =>{},
                    }
                },
                Err(_) =>{ return error("the group message ElementEntry enum is not of Present variant"); },
            }    

        }
        messages_hashes.push(GroupMessageHash(link.target));
    }

    Ok(())
}

pub fn filter_path_children_list(
    path_childrens: &mut Vec<Link>,
    pivot_path: Option<EntryHash>,
) -> ExternResult<()> {
    //->Vec<Link>

    // the pivot path only be a Some(_) if we already collect messages in one path before this called happens in other words if we received the fields last_fecthed and last_message_timestamp as Some(_)
    path_childrens.sort_by_key(|link| link.timestamp);

    match pivot_path {
        Some(path_hash) => {
            if let Some(pivot_position) = path_childrens
                .clone()
                .into_iter()
                .position(|link| link.target.eq(&path_hash))
            {
                // here we will split the path childrens to removed the newest paths from the olders (olders are those who we need to  keep checking)
                path_childrens.truncate(pivot_position);
            } else {
                // this case shouldnt happen but i will handle it as an error (we can modified this in the future)
                return error( "cannot find this pivot into the childrens list ");
            }
        }
        None => (),
    }

    Ok(())
}