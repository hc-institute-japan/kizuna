use super::PinDetail;
use hdk::prelude::*;

pub fn unpin_message_handler(pin_detail: PinDetail) -> ExternResult<()> {
    let mut links = get_links(
        pin_detail.group_hash.clone(),
        Some(LinkTag::new("pinned".to_owned())),
    )?;
    // .into_inner();

    let unpin_message_link_index = links
        .clone()
        .into_iter()
        .position(|link| link.target == pin_detail.group_message_hash);

    if let Some(index) = unpin_message_link_index {
        let unpin_message_link = links.remove(index);
        delete_link(unpin_message_link.create_link_hash)?;
    } else {
        // Simply return Ok when there was no Link found to be unpinned of.
        return Ok(());
    }
    Ok(())
}
