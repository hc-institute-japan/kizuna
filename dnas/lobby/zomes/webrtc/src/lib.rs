use hdk::prelude::*;
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]

struct SignalInput {
    name: String,
    payload: String,
    agents: Vec<AgentPubKey>,
}
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]

struct SignalPayload {
    name: String,
    payload: String,
}

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fuctions = BTreeSet::new();

    let tag: String = "group_zome_cap_grant".into();
    let access: CapAccess = CapAccess::Unrestricted;
    let zome_name: ZomeName = zome_info()?.zome_name;

    fuctions.insert((zome_name.clone(), FunctionName("recv_remote_signal".into())));

    let cap_grant_entry: CapGrantEntry = CapGrantEntry::new(tag, access, fuctions);

    create_cap_grant(cap_grant_entry)?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn signal_rtc(signal_input: SignalInput) -> ExternResult<()> {
    remote_signal(
        ExternIO::encode(SignalPayload {
            name: signal_input.name,
            payload: signal_input.payload,
        })?,
        signal_input.agents.clone(),
    )?;
    Ok(())
}

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let signal_detail: SignalPayload = signal.decode()?;
    emit_signal(&signal_detail)?;
    Ok(())
}
