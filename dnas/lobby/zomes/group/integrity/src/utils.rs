use holochain_deterministic_integrity::prelude::*;

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(wasm_error!(WasmErrorInner::Guest(String::from(reason))))
}

pub fn try_from_record<T: TryFrom<SerializedBytes>>(record: Record) -> ExternResult<T> {
    match record.entry() {
        record::RecordEntry::Present(entry) => try_from_entry::<T>(entry.clone()),
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
