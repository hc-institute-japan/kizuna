use super::PinDetail;
use hdk::prelude::*;

pub fn pin_message_handler(pin_detail: PinDetail) -> ExternResult<()> {
    // create a link between the group entry hash and message hash to signify that a message is pinned
    create_link(
        pin_detail.group_hash,
        pin_detail.group_message_hash,
        LinkTag::new("pinned".to_owned()),
    )?;
    Ok(())
}
