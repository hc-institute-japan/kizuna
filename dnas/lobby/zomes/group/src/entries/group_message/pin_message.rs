use super::PinDetail;
use crate::{
    group::group_helpers::get_group_latest_version,
    signals::{SignalDetails, SignalName, SignalPayload},
    utils::error,
};
use hdk::prelude::*;

pub fn pin_message_handler(pin_detail: PinDetail) -> ExternResult<()> {
    // make sure group message is visible first
    let mut message_element: Option<Element> = None;
    let mut n = 0;
    // only try to get the message entry fixed number of times
    while n < 3 && message_element == None {
        let options = GetOptions::latest();
        message_element = get(pin_detail.group_message_hash.clone(), options)?;
        n += 1
    }
    // create a link between the group entry hash and message hash to signify that a message is pinned
    if let Some(_) = message_element {
        create_link(
            pin_detail.group_hash.clone(),
            pin_detail.group_message_hash.clone(),
            LinkTag::new("pinned".to_owned()),
        )?;
    } else {
        return error("failed to get the message being pinned");
    }

    let group = get_group_latest_version(pin_detail.group_hash.clone())?;
    let members = group.members;
    let creator = group.creator;
    let agent_pub_key = agent_info()?.agent_latest_pubkey;

    let signal_detail = SignalDetails {
        name: SignalName::PIN_MESSAGE_DATA.to_owned(),
        payload: SignalPayload::PinMessageData(pin_detail),
    };

    remote_signal(
        ExternIO::encode(signal_detail)?,
        [vec![creator.clone()], members.clone()]
            .concat()
            .into_iter()
            .filter_map(|agent| {
                if &agent != &agent_pub_key {
                    Some(agent)
                } else {
                    None
                }
            })
            .collect(),
    )?;
    Ok(())
}
