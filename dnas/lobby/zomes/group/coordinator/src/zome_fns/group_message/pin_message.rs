use crate::{
    signals::{SignalDetails, SignalName, SignalPayload},
    utils::error,
    zome_fns::group::group_helpers::get_group_latest_version,
};
use group_coordinator_types::group_message::PinDetail;
use group_integrity::LinkTypes;
use hdk::prelude::*;

pub fn pin_message_handler(pin_detail: PinDetail) -> ExternResult<()> {
    // make sure group message is visible first
    let mut message_record: Option<Record> = None;
    let mut n = 0;
    // only try to get the message entry fixed number of times
    while n < 3 && message_record == None {
        let options = GetOptions::latest();
        message_record = get(pin_detail.group_message_hash.clone(), options)?;
        n += 1
    }
    // create a link between the group entry hash and message hash to signify that a message is pinned
    if let Some(_) = message_record {
        create_link(
            pin_detail.group_hash.clone(),
            pin_detail.group_message_hash.clone(),
            LinkTypes::GroupToGroupMessage,
            LinkTag::new("pinned".to_owned()),
        )?;
    } else {
        return error(String::from("failed to get the message being pinned"));
    }

    let group = get_group_latest_version(pin_detail.group_hash.clone())?;
    let members = group.members;
    let creator = group.creator;
    let agent_pub_key = agent_info()?.agent_latest_pubkey;

    let signal_detail = SignalDetails {
        name: SignalName::PIN_MESSAGE_DATA.to_owned(),
        payload: SignalPayload::PinMessageData(pin_detail),
    };

    match ExternIO::encode(signal_detail) {
        Ok(input) => {
            remote_signal(
                input,
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
        Err(e) => error(String::from(e)),
    }
}
