use hdk::prelude::*;

pub(crate) fn get_my_blocked_list() -> ExternResult<Vec<AgentPubKey>> {
    //call list_blocked() to contacts zome
    let zome_name: ZomeName = ZomeName("contacts".to_owned());
    let function_name: FunctionName = FunctionName("list_blocked".to_owned());

    let my_blocked_list_call_response: ZomeCallResponse = call(
        CallTargetCell::Local, // The cell you want to call (If None will call the current cell).
        zome_name,
        function_name,
        None, //The capability secret if required.
        &(),  //This are the input value we send to the fuction we are calling
    )?;

    let my_blocked_list: Vec<AgentPubKey> =
        call_response_handler(my_blocked_list_call_response)?.decode()?;

    Ok(my_blocked_list)
}

const SECONDS: i64 = 60;
const MINUTES: i64 = 60;
const HOURS: i64 = 24;

pub(crate) fn path_from_str(str: &str) -> ExternResult<Path> {
    let path = Path::from(str);
    path.ensure()?;
    Ok(path)
}

pub(crate) fn timestamp_to_days(timestamp: Timestamp) -> i64 {
    timestamp.as_seconds_and_nanos().0 / (SECONDS * MINUTES * HOURS)
}

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(wasm_error!(WasmErrorInner::Guest(String::from(reason))))
}

pub fn call_response_handler(call_response: ZomeCallResponse) -> ExternResult<ExternIO> {
    match call_response {
        ZomeCallResponse::Ok(extern_io) => {
            return Ok(extern_io);
        }
        ZomeCallResponse::Unauthorized(_, _, function_name, _) => {
            return Err(wasm_error!(WasmErrorInner::Guest(
                String::from("Unauthorized Call to : ") + function_name.as_ref(),
            )));
        }
        ZomeCallResponse::NetworkError(error) => {
            return Err(wasm_error!(WasmErrorInner::Guest(
                String::from("Network Error : ") + error.as_ref(),
            )));
        }
        ZomeCallResponse::CountersigningSession(error) => {
            return Err(wasm_error!(WasmErrorInner::Guest(
                String::from("countersigning error : ") + error.as_ref(),
            )));
        }
    }
}

// slight modification of try_get_and_convert to retrieve the action together with the entry
pub fn try_get_and_convert_with_action<T: TryFrom<SerializedBytes>>(
    entry_hash: EntryHash,
    option: GetOptions,
) -> ExternResult<(SignedActionHashed, T)> {
    match get(entry_hash.clone(), option)? {
        Some(record) => Ok((
            record.signed_action().to_owned(),
            try_from_record(record)?,
        )),
        None => error("Entry not found"),
    }
}

pub fn try_get_and_convert<T: TryFrom<SerializedBytes>>(
    entry_hash: EntryHash,
    option: GetOptions,
) -> ExternResult<T> {
    match get(entry_hash.clone(), option)? {
        Some(record) => try_from_record(record),
        None => error("Entry not found"),
    }
}

pub fn try_from_record<T: TryFrom<SerializedBytes>>(record: Record) -> ExternResult<T> {
    match record.entry() {
        record::RecordEntry::Present(entry) => try_from_entry::<T>(entry.clone()),
        _ => error("Could not convert record"),
    }
}

pub fn try_from_record_with_action<T: TryFrom<SerializedBytes>>(
    record: Record,
) -> ExternResult<(SignedActionHashed, T)> {
    match record.entry() {
        record::RecordEntry::Present(entry) => Ok((
            record.signed_action().to_owned(),
            try_from_entry::<T>(entry.clone())?,
        )),
        _ => error("Could not convert record"),
    }
}

pub fn try_from_entry<T: TryFrom<SerializedBytes>>(entry: Entry) -> ExternResult<T> {
    match entry {
        Entry::App(content) => match T::try_from(content.into_sb()) {
            Ok(e) => Ok(e),
            Err(_) => error("Could not convert entry"),
        },
        _ => error("Could not convert entry"),
    }
}
