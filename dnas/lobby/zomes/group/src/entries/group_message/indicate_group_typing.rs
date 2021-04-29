use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};

use super::GroupTypingDetailData;

pub fn indicate_group_typing_handler(
    group_typing_detail_data: GroupTypingDetailData,
) -> ExternResult<()> {
    let signal_detail: SignalDetails = SignalDetails {
        name: SignalName::GROUP_TYPING_DETAIL.to_owned(),
        payload: SignalPayload::GroupTypingDetail(group_typing_detail_data.clone()),
    };

    remote_signal(
        ExternIO::encode(signal_detail)?,
        group_typing_detail_data.members,
    )?;

    Ok(())
}
