use hdk::prelude::*;

use super::GroupMessageReadData;
use crate::signals::{SignalDetails, SignalName, SignalPayload};

pub fn read_group_message_handler(
    group_message_read_data: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    let my_agent_pubkey = agent_info()?.agent_latest_pubkey;
    for message_entry_hash in group_message_read_data.message_ids.clone() {
        /*
        create_link() actually retrieves the entry of the base and target for validation.
        This means that create_link() may potentially fail if the entry is not found on the DHT.
        This especially can happen in this fn since the message_entry_hash received is of a
        freshly committed entry in DHT. To avoid the "dependency not held" error in create_link(),
        we wait here until the entry can be retrieved even before the create_link() is executed.
        https://forum.holochain.org/t/problem-that-may-occur-when-creating-a-link-between-two-entries-when-the-said-entries-are-literally-just-created-in-the-dht/6316/3
        TODO: use https://docs.rs/hdk/0.0.100/hdk/time/fn.sleep.html to lessen burden.
        */
        let mut message_element: Option<Element> = None;
        let mut n = 0;
        // only try to get the message entry fixed number of times
        while n < 3 && message_element == None {
            let options = GetOptions::latest();
            message_element = get(message_entry_hash.clone(), options)?;
            n += 1
        }
        // link GroupMessage -> AgentPubKey to indicate that it is read
        // with ChainTopOrdering::Relaxed because order doesn't matter
        // only create link if the message entry was retrieved
        if let Some(_) = message_element {
            host_call::<CreateLinkInput, HeaderHash>(
                __create_link,
                CreateLinkInput::new(
                    message_entry_hash,
                    my_agent_pubkey.clone().into(),
                    LinkTag::new("read".to_owned()),
                    ChainTopOrdering::Relaxed,
                ),
            )?;
        }
    }

    let signal_detail = SignalDetails {
        name: SignalName::GROUP_MESSAGE_READ.to_owned(),
        payload: SignalPayload::GroupMessageRead(group_message_read_data.clone()),
    };

    remote_signal(
        ExternIO::encode(signal_detail)?,
        group_message_read_data.members.clone(),
    )?;

    Ok(group_message_read_data)
}
