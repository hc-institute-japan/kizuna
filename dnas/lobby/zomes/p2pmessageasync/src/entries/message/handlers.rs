use hdk3::prelude::*;
use crate::{timestamp::Timestamp};
use crate::utils::{
    try_from_element
};

use super::{
    InboxMessageEntry,
    Inbox,
    MessageInput,
    MessageOutput,
    MessageListWrapper,
    BooleanWrapper,
    // MessageOutputOption,
    Status
};


#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {

    let agent_inbox = Inbox::new(agent_info!()?.agent_latest_pubkey);
    create_entry!(&agent_inbox)?;

    // set unrestricted access to receive_message_async
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "notify_delivery".into()));
    create_cap_grant!(
        CapGrantEntry {
            tag: "acknowledge_async".into(),
            access: ().into(),
            functions,
        }
    )?;
    
    Ok(InitCallbackResult::Pass)
}

pub(crate) fn send_message_async(message_input: MessageInput) -> ExternResult<MessageOutput> {

    if let true = is_user_blocked(message_input.receiver.clone())? {
        return crate::error("You cannot send a message to a contact you have blocked.")
    };

    // build entry structure to be committed into DHT
    // static fields from this point on
    // author, receiver, payload, time_sent
    let now = sys_time!()?;
    let message = InboxMessageEntry {
        author: agent_info!()?.agent_latest_pubkey,
        receiver: message_input.receiver.clone(),
        payload: message_input.payload,
        time_sent: Timestamp(now.as_secs() as i64, now.subsec_nanos()),
        time_received: None,
        status: Status::Sent
    };

    // TOOD: encyrpt data

    // commit public entry to DHT
    create_entry!(&message)?;
    let receiver_inbox = Inbox::new(message_input.receiver.clone());
    
    //link message to receiver's inbox
    create_link!(
        hash_entry!(&receiver_inbox)?,
        hash_entry!(&message)?,
        LinkTag::new(agent_info!()?.agent_latest_pubkey.to_string())
    )?;

    let message_output = MessageOutput::from_inbox_entry(message, Status::Sent);

    Ok(message_output)
}

pub(crate) fn fetch_inbox() -> ExternResult<MessageListWrapper> {
    // construct hash/address of inbox
    let agent_inbox_hash = hash_entry!(Inbox::new(agent_info!()?.agent_latest_pubkey))?;

    // get all messages linked to inbox
    let links = get_links!(agent_inbox_hash)?;

    let mut message_list: Vec<MessageOutput> = Vec::new();
    for link in links.into_inner().into_iter() {
        match get!(link.target)? {
            Some(element) => {
                let _header_hash = element.clone().header_address().to_owned();
                let header = element.clone().header().to_owned();
                let author = header.author();

                if let true = is_user_blocked(author.clone())? {
                    continue
                };

                match try_from_element(element) {
                    Ok(message_entry) => {
                        // create MessageOutput
                        let mut message_output = MessageOutput::from_inbox_entry(message_entry, Status::Delivered);

                        // check message status 
                        match message_output.status.clone() {
                            // message bound to author when author is offline when receiver tried to call remote
                            // confirming receipt of receiver
                            // update message in source chain
                            Status::Sent => {
                                // get message from chain corresponding to message in inbox

                                // construct original entry
                                let original_message = InboxMessageEntry {
                                    author: message_output.author.clone(),
                                    receiver: message_output.receiver.clone(),
                                    payload: message_output.payload.clone(),
                                    time_sent: message_output.time_sent.clone(),
                                    time_received: None,
                                    status: Status::Delivered,
                                };
                                
                                // get hash/address of original entry
                                let original_hash = hash_entry!(&original_message)?;

                                // get element
                                let original_entry = get!(original_hash)?;


                                match original_entry {
                                    Some(element) => {
                                        update_entry!(
                                            element.header_address().to_owned(), 
                                            InboxMessageEntry::from_output(
                                                message_output.clone(), 
                                                Status::Sent
                                            )
                                        )?;
                                        ()
                                    },
                                    _ => return crate::error("{\"code\": \"401\", \"message\": \"The original message cannot be found\"}")
                                }

                            },
                            // message bound to receiver
                            // unreceived message while offline
                            // receive message, update status and timestamps, commit to source chain, unlink from inbox, link to author's inbox
                            Status::Delivered => {
                                // complete fields
                                let now = sys_time!()?;
                                message_output.time_received = Some(Timestamp(now.as_secs() as i64, now.subsec_nanos()));

                                // use call_remote to notify sender of receipt
                                let payload: SerializedBytes = message_output.clone().try_into()?;
                                match call_remote!(
                                    message_output.clone().author,
                                    zome_info!()?.zome_name,
                                    "notify_delivery".into(),
                                    None,
                                    payload
                                )? {
                                    ZomeCallResponse::Ok(_output) => {
                                        // message has been updated on the sender's side
                                        ()
                                    },
                                    ZomeCallResponse::Unauthorized => {
                                        // crate::error("{\"code\": \"401\", \"message\": \"This agent has no proper authorization\"}"
                                        // updating failed
                                        // cases: suddenly blocked, recipient is offline
                                        ()
                                    }
                                }
                                message_list.push(message_output)
                            },
                            _ =>  return crate::error("Could not convert entry")
                        }
                        
                    },
                    _ => return crate::error("Could not convert entry")
                }
            }, 
            _ => return crate::error("Could not get link target")
        }   
    }
    
    Ok(MessageListWrapper(message_list))
}

fn is_user_blocked(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
    match call::<AgentPubKey, BooleanWrapper>(
        None,
        "contacts".into(),
        "in_blocked".into(),
        None,
        agent_pubkey.clone()
    ) {
        Ok(output) => Ok(output.0),
        _ => return crate::error("{\"code\": \"401\", \"message\": \"This agent has no proper authorization\"}")
    }
}

pub(crate) fn notify_delivery(message_entry: MessageOutput) -> ExternResult<BooleanWrapper> {
    // get original message stored in source chain
    let original_message = InboxMessageEntry {
        author: message_entry.author.clone(),
        receiver: message_entry.receiver.clone(),
        payload: message_entry.payload.clone(),
        time_sent: message_entry.time_sent.clone(),
        time_received: None,
        status: Status::Delivered,
    };
    
    // get hash/address of original entry
    let original_hash = hash_entry!(&original_message)?;

    // get element
    let original_entry = get!(original_hash)?;

    match original_entry {
        Some(element) => {
            update_entry!(
                element.header_address().to_owned(), 
                InboxMessageEntry::from_output(
                    message_entry.clone(), 
                    Status::Sent
                )
            )?;
            Ok(BooleanWrapper(true))
        },
        _ => Ok(BooleanWrapper(false))
    }
}

// pub(crate) fn get_all_messages() -> ExternResult<MessageListWrapper> {
//     let query_result = query!(
//         QueryFilter::new()
//         .entry_type(
//             EntryType::App(
//                 AppEntryType::new(
//                     EntryDefIndex::from(0),
//                     zome_info!()?.zome_id,
//                     EntryVisibility::Public
//                 )
//             )
//         )
//         .include_entries(true)
//     )?;

//     let message_vec: Vec<MessageOutput> = query_result.0
//         .into_iter()
//         .filter_map(|el| {
//             let entry = try_from_element(el);
//             match entry {
//                 Ok(message_entry) => {
//                     let message_output = MessageOutput::from_entry(message_entry);
//                     Some(message_output)
//                 },
//                 _ => None
//             }
//         })
//         .collect();

//     Ok(MessageListWrapper(message_vec))
// }

// pub(crate) fn get_all_messages_from_addresses(agent_list: AgentListWrapper) -> ExternResult<MessagesByAgentListWrapper> {
//     let deduped_agents = address_deduper(agent_list.0);

//     let query_result = query!(
//         QueryFilter::new()
//         .entry_type(
//             EntryType::App(
//                 AppEntryType::new(
//                     EntryDefIndex::from(0),
//                     zome_info!()?.zome_id,
//                     EntryVisibility::Public
//                 )
//             )
//         )
//         .include_entries(true)
//     )?;

//     let mut agent_messages_hashmap = std::collections::HashMap::new();
//     for agent in deduped_agents {
//         let message_list: Vec<MessageOutput> = Vec::new();
//         agent_messages_hashmap.insert(agent, message_list);                                                                                                                                                                               
//     };

//     let _map_result = query_result.0
//         .into_iter()
//         .map(|el| {
//             let entry = try_from_element(el);
//             match entry {
//                 Ok(message_entry) => {
//                     let message_output = MessageOutput::from_entry(message_entry);
//                     if agent_messages_hashmap.contains_key(&message_output.author) {
//                         if let Some(vec) = agent_messages_hashmap.get_mut(&message_output.author) {
//                             &vec.push(message_output.clone());
//                         };
//                     }
//                     Some(message_output)
//                 },
//                 _ => None
//             }
//         });

//     let mut agent_messages_vec: Vec<MessagesByAgent> = Vec::new();
//     for (agent, list) in agent_messages_hashmap.iter() {
//         agent_messages_vec.push(
//             MessagesByAgent {
//                 author: agent.to_owned(),
//                 messages: list.to_owned()
//             }
//         );
//     }

//     Ok(MessagesByAgentListWrapper(agent_messages_vec))
// }

// // TODO: change implementation once query! macro accepts timestamp range.
// pub(crate) fn get_batch_messages_on_conversation(message_range: MessageRange) -> ExternResult<MessageListWrapper> {

//     let timegap = 10; //in seconds
//     let batch_size = 10; // number of messages

//     let query_result = query!(
//         QueryFilter::new()
//         .entry_type(
//             EntryType::App(
//                 AppEntryType::new(
//                     EntryDefIndex::from(0),
//                     zome_info!()?.zome_id,
//                     EntryVisibility::Public
//                 )
//             )
//         )
//         .include_entries(true)
//     )?;

//     let mut message_output_vec: Vec<MessageOutput> = Vec::new();
//     for element in query_result.0 {
//         let entry = try_from_element::<MessageEntry>(element);
//         match entry {
//             Ok(message_entry) => {
//                 if message_output_vec.len() <= 0 
//                 || (message_output_vec.len() <= batch_size && message_range.last_message_timestamp_seconds - message_entry.time_sent.0 < timegap) {
//                     if message_entry.author == message_range.author {
//                         if message_entry.time_sent.0 <= message_range.last_message_timestamp_seconds {
//                             let message_output = MessageOutput::from_entry(message_entry);
//                             message_output_vec.push(message_output);
//                         }
//                     };
//                     continue
//                 };
//                 break
//             },
//             _ => continue
//         }
//     };

//     Ok(MessageListWrapper(message_output_vec))
// }