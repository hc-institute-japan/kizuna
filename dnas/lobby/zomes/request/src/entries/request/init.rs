use hdk::prelude::*;

pub fn init_handler() -> ExternResult<InitCallbackResult> {
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info()?.name, "receive_request_to_chat".into()));

    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions,
    })?;

    Ok(InitCallbackResult::Pass)
}
