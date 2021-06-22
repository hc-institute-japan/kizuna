use hdk::prelude::*;
use std::time::Duration;

use crate::entries::group::BlockedWrapper;
use timestamp::Timestamp;

pub(crate) fn to_timestamp(duration: Duration) -> Timestamp {
    Timestamp(duration.as_secs() as i64, duration.subsec_nanos())
}

pub(crate) fn get_my_blocked_list() -> ExternResult<BlockedWrapper> {
    //call list_blocked() to contacts zome
    let zome_name: ZomeName = ZomeName("contacts".to_owned());
    let function_name: FunctionName = FunctionName("list_blocked".to_owned());

    let my_blocked_list_call_response: ZomeCallResponse = call(
        None, // The cell you want to call (If None will call the current cell).
        zome_name,
        function_name,
        None, //The capability secret if required.
        &(),  //This are the input value we send to the fuction we are calling
    )?;

    let my_blocked_list: BlockedWrapper =
        call_response_handler(my_blocked_list_call_response)?.decode()?;

    Ok(my_blocked_list)
}

const SECONDS: i64 = 60;
const MINUTES: i64 = 60;
const HOURS: i64 = 24;

pub(crate) fn path_from_str(str: &str) -> Path {
    let path = Path::from(str);
    path.ensure().expect("Cannot ensure path.");
    path
}

pub(crate) fn timestamp_to_days(seconds: Timestamp) -> i64 {
    seconds.0 / (SECONDS * MINUTES * HOURS)
}

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

pub fn call_response_handler(call_response: ZomeCallResponse) -> ExternResult<ExternIO> {
    match call_response {
        ZomeCallResponse::Ok(extern_io) => {
            return Ok(extern_io);
        }
        ZomeCallResponse::Unauthorized(_, _, function_name, _) => {
            return Err(WasmError::Guest(
                String::from("Unauthorized Call to : ") + function_name.as_ref(),
            ));
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(WasmError::Guest(
                String::from("Network Error : ") + error.as_ref(),
            ));
        }
    }
}
