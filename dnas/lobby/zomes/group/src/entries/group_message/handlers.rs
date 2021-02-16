#![allow(unused_imports)]
use file_types::FileMetadata;
use group::Group;
use hdk3::prelude::timestamp::Timestamp;
use hdk3::{host_fn::remote_signal, prelude::*};
use link::Link;

use std::time::SystemTime;

use file_types::PayloadType;

//LIST OF DEPENDENCIES ADDED FOR MANUEL
use super::{
    GroupEntryHash, GroupMessageContent, GroupMessageElement, GroupMessageHash,
    GroupMessagesContents, GroupMessagesOutput, GroupMsgBatchFetchFilter, MessagesByGroup,
    ReadList,
};
use std::collections::hash_map::HashMap;
//END LIST OF DEPENDENCIES ADDED FOR MANUEL

use crate::{
    entries::group::{self, handlers::get_group_latest_version},
    signals::{SignalDetails, SignalName, SignalPayload},
    utils::{collect, path_from_str, timestamp_to_days, to_timestamp},
};

use super::{
    GroupChatFilter, GroupFileBytes, GroupMessage, GroupMessageData, GroupMessageDataWrapper,
    GroupMessageInput, GroupMessageReadData, GroupTypingDetailData, Payload, PayloadInput,
};

pub fn send_message(message_input: GroupMessageInput) -> ExternResult<GroupMessageData> {
    let payload = match message_input.payload_input.clone() {
        PayloadInput::Text { payload } => Payload::Text { payload },
        PayloadInput::File {
            metadata,
            file_type,
            file_bytes,
        } => {
            let group_file_bytes = GroupFileBytes(file_bytes);
            create_entry(&group_file_bytes)?;
            let group_file_bytes_hash = hash_entry(&group_file_bytes)?;
            Payload::File {
                file_type: file_type,
                metadata: FileMetadata {
                    file_name: metadata.file_name,
                    file_size: metadata.file_size,
                    file_type: metadata.file_type,
                    file_hash: group_file_bytes_hash,
                },
            }
        }
    };

    let message = GroupMessage {
        group_hash: message_input.group_hash.clone(),
        payload,
        created: to_timestamp(sys_time()?),
        sender: message_input.sender.clone(),
        reply_to: message_input.reply_to.clone(),
    };

    // commit GroupMessage entry
    create_entry(&message)?;

    let group_hash = message.group_hash.clone().to_string(); // message's group hash as string
    let days = timestamp_to_days(message.created.clone()).to_string(); // group message's timestamp into days as string

    let group_hash_timestamp_path_hash = path_from_str(&[group_hash, days].join(".")).hash()?;

    create_link(
        group_hash_timestamp_path_hash,
        hash_entry(&message)?,
        LinkTag::new(match message.payload {
            Payload::Text { payload: _ } => "text".to_owned(),
            Payload::File {
                metadata: _,
                file_type: _,
            } => "file".to_owned(),
        }),
    )?;

    let latest_group_version = get_group_latest_version(message.group_hash.clone())?;

    let message_hash = hash_entry(&message)?;
    let group_message_data = GroupMessageData {
        id: message_hash,
        content: message,
    };

    let signal = SignalDetails {
        name: SignalName::GROUP_MESSAGE_DATA.to_owned(),
        payload: SignalPayload::GroupMessageData(group_message_data.clone()),
    };

    remote_signal(
        &signal,
        [
            vec![latest_group_version.creator.clone()],
            latest_group_version.members.clone(),
        ]
        .concat()
        .into_iter()
        .filter_map(|agent| {
            if &agent != &message_input.sender {
                Some(agent)
            } else {
                None
            }
        })
        .collect(),
    )?;
    Ok(group_message_data)
}

pub fn get_all_messages(group_hash: EntryHash) -> ExternResult<GroupMessageDataWrapper> {
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

pub fn indicate_group_typing(group_typing_detail_data: GroupTypingDetailData) -> ExternResult<()> {
    let signal_detail: SignalDetails = SignalDetails {
        name: SignalName::GROUP_TYPING_DETAIL.to_owned(),
        payload: SignalPayload::GroupTypingDetail(group_typing_detail_data.clone()),
    };
    remote_signal(&signal_detail, group_typing_detail_data.members)?;
    Ok(())
}

pub fn read_group_message(
    group_message_read_data: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    let my_agent_pubkey = agent_info()?.agent_latest_pubkey;
    for message_entry_hash in group_message_read_data.message_ids.clone() {
        // link GroupMessage -> AgentPubKey to indicate that it is read.
        create_link(
            message_entry_hash,
            my_agent_pubkey.clone().into(),
            LinkTag::new("read".to_owned()),
        )?;
    }
    let signal_detail = SignalDetails {
        name: SignalName::GROUP_MESSAGE_READ.to_owned(),
        payload: SignalPayload::GroupMessageRead(group_message_read_data.clone()),
    };
    remote_signal(&signal_detail, group_message_read_data.members.clone())?;
    Ok(group_message_read_data)
}

pub fn get_next_batch_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    let group_id: EntryHash = filter.group_id;
    let last_fetched: Option<EntryHash> = filter.last_fetched;
    let last_message_timestamp: Option<Timestamp> = filter.last_message_timestamp;
    let batch_size: usize = filter.batch_size.into();
    let payload_type: PayloadType = filter.payload_type;

    let mut linked_messages: Vec<Link>;

    let mut messages_hashes: Vec<GroupMessageHash> = vec![];
    let mut messages_by_group: HashMap<GroupEntryHash, Vec<GroupMessageHash>> = HashMap::new(); // not used yet
    let mut group_messages_contents: HashMap<GroupMessageHash, GroupMessageContent> =
        HashMap::new();

    let mut pivot_path: Option<EntryHash> = None; // this variable wiil be used if we dont reach the batch_size from the first path evaluated.

    if last_fetched.is_some() && last_message_timestamp.is_some() {
        //1- generate the especific path

        let days: String = timestamp_to_days(last_message_timestamp.clone().unwrap()).to_string();

        match path_from_str(&[group_id.clone().to_string(), days].join(".")).hash() {
            Ok(path_hash) => {
                pivot_path = Some(path_hash.clone());

                //get the messages linked to this path (this list was sorted & filter inside the method )
                linked_messages = get_linked_messages_from_path(
                    path_hash,
                    payload_type.clone(),
                    last_fetched.clone(),
                )?;

                //we will collect the messages and all the info we need of then using this function
                collect_messages_info(
                    &mut linked_messages, // the linked message list contains all the messages linked to one especific path
                    batch_size.clone(),
                    &mut messages_hashes,
                    &mut group_messages_contents,
                )?;
            }
            Err(_) => {
                //when this error can be generated? get the hash for a given entry should be safe
                return Err(HdkError::Wasm(WasmError::Zome(
                    "Cannot get the path hash".into(),
                )));
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

            let path_hash: EntryHash = path_childrens.pop().unwrap().target; // this unwrap is safe (we check the vector wasnt empty before do this)

            //get the messages linked to this path (this list was sorted & filter inside the method )
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
    messages_by_group.insert(GroupEntryHash(group_id), messages_hashes);

    Ok(GroupMessagesOutput {
        messages_by_group: MessagesByGroup(messages_by_group),
        group_messages_contents: GroupMessagesContents(group_messages_contents),
    })
}

fn get_linked_messages_from_path(
    path_hash: EntryHash,
    payload_type: PayloadType,
    last_fetched: Option<EntryHash>,
) -> HdkResult<Vec<Link>> {
    //this method return the messages linked to the path, if the args given have a last_fetched then this method will filter the linked messages and will remove those links newest than the last_fecthed

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

fn collect_messages_info(
    linked_messages: &mut Vec<Link>,
    batch_size: usize,
    messages_hashes: &mut Vec<GroupMessageHash>,
    group_messages_contents: &mut HashMap<GroupMessageHash, GroupMessageContent>,
) -> HdkResult<()> {
    let mut read_list: HashMap<AgentPubKey, SystemTime> = HashMap::new();

    loop {
        if linked_messages.is_empty() || messages_hashes.len() >= batch_size {
            break;
        }

        let link: Link = linked_messages.pop().unwrap();

        if let Some(message_element) = get(link.target.clone(), GetOptions::content())? {
            // here i collect all the values to fill the group_message_content this values are:

            // - the message entry_hash (aka the link target )
            // - the message element (got it using get to the entry hash of the message )
            // - the read_list for that message ( got it from the links related to the message with the tag "read" )

            let read_links: Vec<Link> =
                get_links(link.target.clone(), Some(LinkTag::new("read")))?.into_inner();

            for link in read_links {
                read_list.insert(link.target.into(), link.timestamp);
            }

            group_messages_contents.insert(
                GroupMessageHash(link.target.clone()),
                GroupMessageContent(
                    GroupMessageElement(message_element),
                    ReadList(read_list.clone()),
                ),
            );

            read_list.clear();
        }

        messages_hashes.push(GroupMessageHash(link.target));
    }

    Ok(())
}

fn filter_path_children_list(
    path_childrens: &mut Vec<Link>,
    pivot_path: Option<EntryHash>,
) -> HdkResult<()> {
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
                return Err(HdkError::Wasm(WasmError::Zome(
                    "cannot find this pivot into the childrens list ".into(),
                )));
            }
        }
        None => (),
    }

    Ok(())
}
