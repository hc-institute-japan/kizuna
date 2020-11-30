use hdk3::prelude::*;
use crate::{timestamp::Timestamp};
use crate::utils::{
    try_from_element,
    try_from_entry
};

use super::{
    MessageEntry,
    InboxMessageEntry,
    Inbox,
    Outbox,
    MessageInput,
    MessageOutput,
    MessageListWrapper,
    BooleanWrapper,
    MessageOutputOption
};


#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {

    // initialize public entries Inbox and Outbox
    let agent_inbox = Inbox::new(agent_info!()?.agent_latest_pubkey);
    let agent_outbox = Outbox::new(agent_info!()?.agent_latest_pubkey);
    create_entry!(&agent_inbox)?;
    create_entry!(&agent_outbox)?;

    // set unrestricted access to receive_message_async
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "acknowledge_async".into()));
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

    if let true = am_i_blocked(message_input.receiver.clone())? {
        return crate::error("You cannot send a message to a contact who has blocked you.")
    };
    if let true = is_receiver_blocked(message_input.receiver.clone())? {
        return crate::error("You cannot send a message to a contact you have blocked.")
    };

    // build entry structure to be committed into DHT
    let now = sys_time!()?;
    let message = InboxMessageEntry {
        author: agent_info!()?.agent_latest_pubkey,
        receiver: message_input.receiver.clone(),
        payload: message_input.payload,
        time_sent: Timestamp(now.as_secs() as i64, now.subsec_nanos()),
        time_received: None
    };

    // TOOD: encyrpt data

    // commit public entry to DHT
    create_entry!(&message)?;
    let agent_outbox = Outbox::new(agent_info!()?.agent_latest_pubkey);
    let receiver_inbox = Inbox::new(message_input.receiver.clone());
    
    //link message to agent's outbox
    create_link!(
        hash_entry!(&agent_outbox)?,
        hash_entry!(&message)?,
        LinkTag::new(message_input.receiver.to_string())
    )?;

    //link message to receiver's inbox
    create_link!(
        hash_entry!(&receiver_inbox)?,
        hash_entry!(&message)?,
        LinkTag::new(agent_info!()?.agent_latest_pubkey.to_string())
    )?;

    let message_output = MessageOutput::from_inbox_entry(message);

    // commmit private entry to source chain (while no outbox implementation)
    let private_entry = MessageEntry::from_output(message_output.clone());
    let _address = create_entry!(&private_entry);

    Ok(message_output)
}

// to be removed
pub(crate) fn fetch_outbox() -> ExternResult<MessageListWrapper> {
    // construct hash/address of outbox
    let agent_outbox_hash = hash_entry!(Outbox::new(agent_info!()?.agent_latest_pubkey))?;

    // get all messages linked to outbox
    let links = get_links!(agent_outbox_hash)?;
    let message_list = links
        .into_inner()
        .into_iter()
        .filter_map(|link| {
            match get_details!(link.clone().target) {
                // 1: link target entry exists
                Ok(Some(details)) => {
                    match details {
                        // 2: entry details exists
                        Details::Entry(entry_details) => {
                            // 3: update headers exist
                            if entry_details.updates.clone().into_iter().len() > 0 {
                                // TODO: get the latest update     
                                let update_header = (entry_details.updates)[0].clone().into_inner().1;
                                match get!(update_header) {
                                    // 4A: updated entry exists at header address
                                    Ok(Some(element)) => {
                                        match try_from_element(element) {
                                            Ok(message_entry) => {
                                                let message_output = MessageOutput::from_entry(message_entry);
                                                Some(message_output)
                                            },
                                            _ => None
                                        }
                                    }
                                    // 4B: updated entry does not exist at header address
                                    _ => None
                                }
                            // 3: update headers do not exist -- get single entry
                            } else {
                                match try_from_entry(entry_details.entry) {
                                    // 4B: entry to app entry
                                    Ok(message_entry) => Some(message_entry),
                                    // 4B: app entry cannot be made 
                                    _ => None
                                }
                            }
                        },
                        // 2: entry details do not exist
                        _ => None
                    }
                },
                // 1: link target entry does not exist
                _ => None
            }
        })
        .collect();
    
    Ok(MessageListWrapper(message_list))
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
                let header_hash = element.clone().header_address().to_owned();
                let header = element.clone().header().to_owned();
                let author = header.author();

                if let true = am_i_blocked(author.clone())? {
                    continue
                };
                if let true = is_receiver_blocked(author.clone())? {
                    continue
                };

                match try_from_element(element) {
                    Ok(message_entry) => {
                        // create MessageOutput
                        let mut message_output = MessageOutput::from_entry(message_entry);
                        let now = sys_time!()?;
                        message_output.time_received = Some(Timestamp(now.as_secs() as i64, now.subsec_nanos()));

                        // update InboxMessageEntry in DHT
                        let _new_address = update_entry!(header_hash.to_owned(), InboxMessageEntry::from_output(message_output.clone()))?;

                        // commit MessageEntry to source chain
                        let private_entry = MessageEntry::from_output(message_output.clone());
                        let _address = create_entry!(&private_entry);
                        
                        // use call_remote instead of updating entry in DHT
                        let payload: SerializedBytes = message_output.clone().try_into()?;
                        match call_remote!(
                            message_output.clone().author,
                            zome_info!()?.zome_name,
                            "acknowledge_async".into(),
                            None,
                            payload
                        )? {
                            ZomeCallResponse::Ok(_output) => (),
                            ZomeCallResponse::Unauthorized => () //crate::error("{\"code\": \"401\", \"message\": \"This agent has no proper authorization\"}")
                        }

                        message_list.push(message_output)
                    },
                    _ => return crate::error("Could not convert entry")
                }
            }, 
            _ => return crate::error("Could not get link target")
        }   
    }
    
    Ok(MessageListWrapper(message_list))
}


fn am_i_blocked(agent_pubkey: AgentPubKey) -> ExternResult<bool>{
    let payload_1: SerializedBytes = agent_info!()?.agent_latest_pubkey.try_into()?;
    match call_remote!(
        agent_pubkey.clone(),
        "contacts".into(),
        "in_blocked".into(),
        None,
        payload_1
    )? {
        ZomeCallResponse::Ok(output) => {
            let block_status: BooleanWrapper = output.into_inner().try_into()?;
            // Some(block_status)
            Ok(block_status.0)
        },
        ZomeCallResponse::Unauthorized => return crate::error("{\"code\": \"401\", \"message\": \"This agent has no proper authorization\"}")
    }

}

fn is_receiver_blocked(agent_pubkey: AgentPubKey) -> ExternResult<bool> {
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

pub(crate) fn acknowledge_async(message_input: MessageOutput) -> ExternResult<MessageOutputOption> {
    // commit messsage to chain
    let private_entry = MessageEntry::from_output(message_input);
    match create_entry!(&private_entry) {
        Ok(_address) => {
            let message_output = MessageOutput::from_entry(private_entry);
            Ok(MessageOutputOption(Some(message_output)))
        },
        _ => Ok(MessageOutputOption(None))
    }
}