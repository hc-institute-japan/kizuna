use hdk::prelude::*;

use crate::{
    group::group_helpers::get_group_latest_version,
    group_message::{GroupMessage, GroupMessageData, GroupMessageWithId},
    signals::{SignalDetails, SignalName, SignalPayload},
    utils::{try_from_record, try_get_and_convert},
};

pub fn group_message_post_commit(create_action: Create) -> ExternResult<()> {
    // this should always hit the cache
    let group_message: GroupMessage =
        try_get_and_convert(create_action.entry_hash.clone(), GetOptions::latest())?;
    let mut replied_message_with_id: Option<GroupMessageWithId> = None;
    if let Some(hash) = group_message.reply_to.clone() {
        // this should not hit None assuming that the prior send_message call
        // was able to fetch the replied message
        let message_record: Option<Record> = get(hash.clone(), GetOptions::latest())?;
        if let Some(e) = message_record {
            let replied_message = try_from_record(e)?;
            replied_message_with_id = Some(GroupMessageWithId {
                id: hash,
                content: replied_message,
            })
        }
    }
    let sender = group_message.sender.clone();
    let mut group_message_data: GroupMessageData = GroupMessageData {
        message_id: create_action.entry_hash,
        group_hash: group_message.group_hash.clone(),
        payload: group_message.payload.clone(),
        created: group_message.created.clone(),
        sender: sender.clone(),
        reply_to: None,
    };
    let latest_group_version = get_group_latest_version(group_message.group_hash)?;
    group_message_data.reply_to = replied_message_with_id;

    let signal = SignalDetails {
        name: SignalName::GROUP_MESSAGE_DATA.to_owned(),
        payload: SignalPayload::GroupMessageData(group_message_data),
    };

    remote_signal(
        ExternIO::encode(signal)?,
        [
            vec![latest_group_version.creator.clone()],
            latest_group_version.members.clone(),
        ]
        .concat()
        .into_iter()
        .filter_map(|agent| if &agent != &sender { Some(agent) } else { None })
        .collect(),
    )?;
    Ok(())
}
