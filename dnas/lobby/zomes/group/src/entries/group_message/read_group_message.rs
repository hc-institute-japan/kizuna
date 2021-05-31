use hdk::prelude::*;

use super::GroupMessageReadData;
use crate::signals::{SignalDetails, SignalName, SignalPayload};

pub fn read_group_message_handler(
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

    remote_signal(
        ExternIO::encode(signal_detail)?,
        group_message_read_data.members.clone(),
    )?;
    Ok(group_message_read_data)
}
