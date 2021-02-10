use hdk3::prelude::*;
use std::time::Duration;

use timestamp::Timestamp;

use crate::entries::group::BlockedWrapper;

pub(crate) fn to_timestamp(duration: Duration) -> Timestamp {
    Timestamp(duration.as_secs() as i64, duration.subsec_nanos())
}

pub(crate) fn get_my_blocked_list() -> HdkResult<BlockedWrapper> {
    //call list_blocked() to contacts zome
    let zome_name: ZomeName = ZomeName("contacts".to_owned());
    let function_name: FunctionName = FunctionName("list_blocked".to_owned());

    let my_blocked_list: BlockedWrapper = call(
        None, // The cell you want to call (If None will call the current cell).
        zome_name,
        function_name,
        None, //The capability secret if required.
        &(),  //This are the input value we send to the fuction we are calling
    )?;

    Ok(my_blocked_list)
}
