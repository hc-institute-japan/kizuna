use hdk::prelude::*;

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

pub fn path_from_str(str: &str) -> Path {
    let path = Path::from(str);
    path.ensure().expect("Cannot ensure path.");
    path
}

// slight modification of try_get_and_convert to retrieve the header together with the entry
pub fn _try_get_and_convert_with_header<T: TryFrom<SerializedBytes>>(
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

pub fn _try_from_element_with_header<T: TryFrom<SerializedBytes>>(
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
