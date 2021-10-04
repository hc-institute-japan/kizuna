use hdk::prelude::*;
mod foo;
use foo::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct AgentPubKeyWrapper(AgentPubKey);

entry_defs![Foo::entry_def()];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let zome_name: ZomeName = zome_info()?.zome_name;

    let mut receive_message_function: GrantedFunctions = BTreeSet::new();
    receive_message_function.insert((zome_name.clone(), "receive_foo".into()));

    create_cap_grant(CapGrantEntry {
        tag: "receive_foo".into(),
        access: CapAccess::Unrestricted,
        functions: receive_message_function,
    })?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn send_foo(receiver: AgentPubKey) -> ExternResult<Foo> {
    let foo: Foo = Foo {
        content: "foo".into(),
        time_sent: sys_time()?,
    };
    let receive_call_result: ZomeCallResponse = call_remote(
        receiver.clone(),
        zome_info()?.zome_name,
        "receive_foo".into(),
        None,
        &foo,
    )?;

    match receive_call_result {
        ZomeCallResponse::Ok(_) => {
            let foo_entry = Entry::App(foo.clone().try_into()?);
            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(
                    Foo::entry_def().id,
                    foo_entry.clone(),
                    ChainTopOrdering::Relaxed,
                ),
            )?;
            Ok(foo)
        }
        ZomeCallResponse::Unauthorized(_, _, _, _) => {
            return error("Sorry, something went wrong. [Authorization error]");
        }
        ZomeCallResponse::NetworkError(_e) => {
            return error("Sorry, something went wrong. [Network error]");
        }
        ZomeCallResponse::CountersigningSession(_e) => {
            return error("Sorry, something went wrong. [Countersigning error]");
        }
    }
}

#[hdk_extern]
fn receive_foo(input: Foo) -> ExternResult<()> {
    let foo_entry = Entry::App(input.clone().try_into()?);
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(Foo::entry_def().id, foo_entry, ChainTopOrdering::Relaxed),
    )?;
    Ok(())
}

#[hdk_extern]
fn get_all_foos(_: ()) -> ExternResult<FoosWrapper> {
    let mut foos: Vec<Foo> = Vec::default();
    let mut queried_foo: Vec<Element> = query(
        QueryFilter::new()
            .entry_type(EntryType::App(AppEntryType::new(
                EntryDefIndex::from(0),
                zome_info()?.zome_id,
                EntryVisibility::Private,
            )))
            .include_entries(true),
    )?;
    queried_foo.reverse();

    for element in queried_foo.into_iter() {
        let foo: Foo = element.try_into()?;
        foos.push(foo)
    }
    Ok(FoosWrapper(foos))
}
