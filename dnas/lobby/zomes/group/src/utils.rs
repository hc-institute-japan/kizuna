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

const SECONDS: i64 = 60;
const MINUTES: i64 = 60;
const HOURS: i64 = 24;

pub fn path_from_str(str: &str) -> Path {
    let path = Path::from(str);
    path.ensure().expect("Cannot ensure path.");
    path
}

pub fn timestamp_to_days(seconds: Timestamp) -> i64 {
    seconds.0 / (SECONDS * MINUTES * HOURS)
}

pub fn collect<A, B>(vec: Vec<A>, callback: fn(A) -> HdkResult<B>) -> HdkResult<Vec<B>> {
    vec.into_iter().map(|item| callback(item)).collect()
}
