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
pub fn _get_next_batch_group_messages(
    filter: GroupMsgBatchFetchFilter,
) -> ExternResult<GroupMessagesOutput> {
    //construct Path from group_id && get his children list
    let group_path: Path = path_from_str(&filter.group_id.to_string());
    let mut path_childrens_to_fetch: Vec<Link> = group_path.children()?.into_inner();
    path_childrens_to_fetch.sort_by_key(|child| child.timestamp);

    //[if last_fetched && last_message_timestamp]
    if filter.last_fetched.is_some() && filter.last_message_timestamp.is_some() {
        //when we got this field supllied from the ui we can filter the path childrens before we start to fecth the messages

        let last_message_timestamp: Timestamp = filter.last_message_timestamp.clone().unwrap();
        let days: String = timestamp_to_days(last_message_timestamp.clone()).to_string();

        match path_from_str(&[filter.group_id.clone().to_string(), days].join(".")).hash() {
            Ok(path_hash) => {
                // the filtering in the childrens consist in split the path_childrens_to_fecth into a smaller list just keeping the oldest ones

                let pivot: usize = path_childrens_to_fetch
                    .clone()
                    .into_iter()
                    .position(|link| link.target.eq(&path_hash))
                    .unwrap()
                    + 1;

                path_childrens_to_fetch = path_childrens_to_fetch.split_at(pivot).0.to_vec();
            }
            Err(_) => {
                //when this error can be generated? get the hash for a given entry should be safe
                return Err(HdkError::Wasm(WasmError::Zome(
                    "Cannot get the path hash".into(),
                )));
            }
        }
    } // end of [if last_fetched && last_message_timestamp]

    //after the filtering process we have the list of the path to fectch for the messages so we'll collect those messages hashes until we reach the batch_size or we run out of path to keep fetching

    let batch_size: usize = filter.batch_size.into();
    let mut messages_hashes: Vec<GroupMessageHash> = vec![];
    let group_id: GroupEntryHash = GroupEntryHash(filter.group_id.clone());

    let mut firts_iteration: bool = true;
    let mut link_to_path: Link;
    let mut _linked_messages: Vec<Link> = vec![];

    let mut messages_by_group: HashMap<GroupEntryHash, Vec<GroupMessageHash>> = HashMap::new();
    let mut group_messages_contents: HashMap<GroupMessageHash, GroupMessageContent> =
        HashMap::new();
    let mut read_list: HashMap<AgentPubKey, SystemTime> = HashMap::new();

    loop {
        if path_childrens_to_fetch.is_empty() || messages_hashes.len() >= batch_size {
            break;
        }

        link_to_path = path_childrens_to_fetch.pop().unwrap();

        match filter.payload_type {
            PayloadType::Text => {
                _linked_messages =
                    get_links(link_to_path.target, Some(LinkTag::new("text")))?.into_inner();
            }
            PayloadType::File => {
                _linked_messages =
                    get_links(link_to_path.target, Some(LinkTag::new("file")))?.into_inner();
            }
            PayloadType::All => {
                _linked_messages = get_links(link_to_path.target, None)?.into_inner();
            }
        }

        _linked_messages.sort_by_key(|link| link.timestamp);

        if firts_iteration
            && filter.last_fetched.clone().is_some()
            && filter.last_message_timestamp.is_some()
        {
            // when we got last feched and last_message_timestamp we'll want to begin fecthing from that point again and keep going backwards

            let last_message_fetched_hash: EntryHash = filter.last_fetched.clone().unwrap();

            let pivot: usize = _linked_messages
                .clone()
                .into_iter()
                .position(|link| link.target.eq(&last_message_fetched_hash))
                .unwrap();
            _linked_messages = _linked_messages.split_at(pivot).0.to_vec();

            firts_iteration = false;
        }

        loop {
            if _linked_messages.is_empty() || messages_hashes.len() >= batch_size {
                break;
            }

            let link: Link = _linked_messages.pop().unwrap();

            if let Some(message_element) = get(link.target.clone(), GetOptions::content())? {
                //here i collect all the values to fill the group_message_content this values are:

                // -the message entry_hash (aka the link target )
                // -the message element (got it using get to  the entry hash of the message )
                // -the read_list for that message ( got it from the links related to the message with the tag "read" )

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
    }

    // at this point we have all the data we need to returned to the ui

    messages_by_group.insert(group_id, messages_hashes);

    let output: GroupMessagesOutput = GroupMessagesOutput {
        messages_by_group: MessagesByGroup(messages_by_group),
        group_messages_contents: GroupMessagesContents(group_messages_contents),
    };

    Ok(output)
}
