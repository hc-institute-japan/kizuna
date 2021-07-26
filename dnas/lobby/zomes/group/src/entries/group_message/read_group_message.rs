use hdk::prelude::*;

use super::GroupMessageReadData;
use crate::signals::{SignalDetails, SignalName, SignalPayload};

pub fn read_group_message_handler(
    group_message_read_data: GroupMessageReadData,
) -> ExternResult<GroupMessageReadData> {
    // We immediately send a signal for immediate feedback for other agents.
    let signal_detail = SignalDetails {
        name: SignalName::GROUP_MESSAGE_READ.to_owned(),
        payload: SignalPayload::GroupMessageRead(group_message_read_data.clone()),
    };

    remote_signal(
        ExternIO::encode(signal_detail)?,
        group_message_read_data.members.clone(),
    )?;

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
        TODO: refactor the flow of creating a link from an EntryHash received from the signal as
        the receiver of signal has no guarantee that the sender of signal succefully created the entry
        */
        let mut message_entry: Option<Element> = None;
        while let None = message_entry {
            let options = GetOptions::content();
            message_entry = get(message_entry_hash.clone(), options)?;
        }
        // link GroupMessage -> AgentPubKey to indicate that it is read.
        create_link(
            message_entry_hash,
            my_agent_pubkey.clone().into(),
            LinkTag::new("read".to_owned()),
        )?;
    }

    Ok(group_message_read_data)
}
