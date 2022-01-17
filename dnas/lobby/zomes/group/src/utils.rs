use hdk::prelude::*;

pub(crate) fn get_my_blocked_list() -> ExternResult<Vec<AgentPubKey>> {
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
        ZomeCallResponse::CountersigningSession(error) => {
            return Err(WasmError::Guest(
                String::from("countersigning error : ") + error.as_ref(),
            ));
        }
    }
}

// slight modification of try_get_and_convert to retrieve the header together with the entry
pub fn try_get_and_convert_with_header<T: TryFrom<SerializedBytes>>(
    entry_hash: EntryHash,
    option: GetOptions,
) -> ExternResult<(SignedHeaderHashed, T)> {
    match get(entry_hash.clone(), option)? {
        Some(element) => Ok((
            element.signed_header().to_owned(),
            try_from_element(element)?,
        )),
        None => error("Entry not found"),
    }
}

pub fn try_get_and_convert<T: TryFrom<SerializedBytes>>(
    entry_hash: EntryHash,
    option: GetOptions,
) -> ExternResult<T> {
    match get(entry_hash.clone(), option)? {
        Some(element) => try_from_element(element),
        None => error("Entry not found"),
    }
}

pub fn try_from_element<T: TryFrom<SerializedBytes>>(element: Element) -> ExternResult<T> {
    match element.entry() {
        element::ElementEntry::Present(entry) => try_from_entry::<T>(entry.clone()),
        _ => error("Could not convert element"),
    }
}

pub fn try_from_element_with_header<T: TryFrom<SerializedBytes>>(
    element: Element,
) -> ExternResult<(SignedHeaderHashed, T)> {
    match element.entry() {
        element::ElementEntry::Present(entry) => Ok((
            element.signed_header().to_owned(),
            try_from_entry::<T>(entry.clone())?,
        )),
        _ => error("Could not convert element"),
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
