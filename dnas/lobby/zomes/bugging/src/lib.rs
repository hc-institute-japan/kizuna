use hdk::prelude::*;
mod foo;
use foo::*;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct AgentPubKeyWrapper(AgentPubKey);

entry_defs![Foo::entry_def()];

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn send_foo(_: ()) -> ExternResult<Foo> {
    let foo: Foo = Foo {
        content: "foo".into(),
        time_sent: sys_time()?,
    };
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
