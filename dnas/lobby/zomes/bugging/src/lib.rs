use hdk::prelude::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct Foo {
    content: String,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct Bar {
    content: String,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct AgentPubKeyWrapper(AgentPubKey);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct FoosWrapper(Vec<Foo>);

entry_def!(Foo
  EntryDef {
      id: "foo".into(),
      visibility: EntryVisibility::Private,
      crdt_type: CrdtType,
      required_validations: RequiredValidations::default(),
      required_validation_type: RequiredValidationType::Element
  }
);

entry_def!(Bar
  EntryDef {
      id: "bar".into(),
      visibility: EntryVisibility::Private,
      crdt_type: CrdtType,
      required_validations: RequiredValidations::default(),
      required_validation_type: RequiredValidationType::Element
  }
);

entry_defs![Foo::entry_def(), Bar::entry_def()];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let zome_name: ZomeName = zome_info()?.zome_name;

    let mut receive_foo_function: GrantedFunctions = BTreeSet::new();
    receive_foo_function.insert((zome_name.clone(), "receive_foo".into()));

    create_cap_grant(CapGrantEntry {
        tag: "receive_foo".into(),
        access: CapAccess::Unrestricted,
        functions: receive_foo_function,
    })?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn send_foo(receiver: AgentPubKeyWrapper) -> ExternResult<Bar> {
    let foo: Foo = Foo {
        content: "foo".into(),
    };
    debug!("foo is created here {:?}", foo);
    let receive_call_result: ZomeCallResponse = call_remote(
        receiver.0,
        zome_info()?.zome_name,
        "receive_foo".into(),
        None,
        &foo,
    )?;
    debug!("foo is created here {:?}", receive_call_result);

    match receive_call_result {
        ZomeCallResponse::Ok(o) => {
            let received_bar: Bar = o.decode()?;
            let bar_entry = Entry::App(received_bar.clone().try_into()?);
            let foo_entry = Entry::App(foo.clone().try_into()?);
            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(Foo::entry_def().id, foo_entry, ChainTopOrdering::Relaxed),
            )?;
            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(Bar::entry_def().id, bar_entry, ChainTopOrdering::Relaxed),
            )?;
            Ok(received_bar)
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
fn receive_foo(foo: Foo) -> ExternResult<Bar> {
    debug!("foo is received here {:?}", foo);
    let bar: Bar = Bar {
        content: "bar".into(),
    };
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            Foo::entry_def().id,
            Entry::App(foo.clone().try_into()?),
            ChainTopOrdering::Relaxed,
        ),
    )?;
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            Foo::entry_def().id,
            Entry::App(bar.clone().try_into()?),
            ChainTopOrdering::Relaxed,
        ),
    )?;
    Ok(bar)
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
