use super::PinDetail;
use crate::utils::error;
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
            pin_detail.group_hash,
            pin_detail.group_message_hash,
            LinkTag::new("pinned".to_owned()),
        )?;
    } else {
        return error("failed to get the message being pinned");
    }
    Ok(())
}
