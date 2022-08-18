use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};
use crate::utils::*;

use group_coordinator_types::group_message::GroupTypingDetailData;

pub fn indicate_group_typing_handler(
    group_typing_detail_data: GroupTypingDetailData,
) -> ExternResult<()> {
    let signal_detail: SignalDetails = SignalDetails {
        name: SignalName::GROUP_TYPING_DETAIL.to_owned(),
        payload: SignalPayload::GroupTypingDetail(group_typing_detail_data.clone()),
    };

    match ExternIO::encode(signal_detail) {
        Ok(input) => {
            remote_signal(input, group_typing_detail_data.members)?;

            Ok(())
        }
        Err(e) => error(String::from(e)),
    }
}
