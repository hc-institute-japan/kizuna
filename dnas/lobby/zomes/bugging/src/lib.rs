use hdk::prelude::*;
mod message;
use message::{MessageDataAndReceipt, *};

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct AgentPubKeyWrapper(AgentPubKey);

entry_defs![P2PMessage::entry_def(), P2PMessageReceipt::entry_def()];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(WasmError::Guest(String::from(reason)))
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let zome_name: ZomeName = zome_info()?.zome_name;

    let mut receive_message_function: GrantedFunctions = BTreeSet::new();
    receive_message_function.insert((zome_name.clone(), "receive_message".into()));

    create_cap_grant(CapGrantEntry {
        tag: "receive_message".into(),
        access: CapAccess::Unrestricted,
        functions: receive_message_function,
    })?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn send_message(message_input: MessageInput) -> ExternResult<MessageDataAndReceipt> {
    let message = P2PMessage {
        author: agent_info()?.agent_latest_pubkey,
        receiver: message_input.receiver.clone(),
        payload: message_input.payload,
        time_sent: sys_time()?,
        reply_to: message_input.reply_to,
    };
    let receive_input = ReceiveMessageInput(message.clone(), None);
    let receive_call_result: ZomeCallResponse = call_remote(
        message_input.receiver.clone(),
        zome_info()?.zome_name,
        "receive_message".into(),
        None,
        &receive_input,
    )?;

    match receive_call_result {
        ZomeCallResponse::Ok(o) => {
            let received_receipt: P2PMessageReceipt = o.decode()?;

            let received_receipt_entry = Entry::App(received_receipt.clone().try_into()?);
            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(
                    P2PMessageReceipt::entry_def().id,
                    received_receipt_entry,
                    ChainTopOrdering::Relaxed,
                ),
            )?;

            let message_entry = Entry::App(message.clone().try_into()?);
            host_call::<CreateInput, HeaderHash>(
                __create,
                CreateInput::new(
                    P2PMessage::entry_def().id,
                    message_entry.clone(),
                    ChainTopOrdering::Relaxed,
                ),
            )?;
            let message_return = P2PMessageData {
                author: message.author.clone(),
                receiver: message.receiver.clone(),
                payload: message.payload.clone(),
                time_sent: message.time_sent.clone(),
                reply_to: None,
            };

            Ok(MessageDataAndReceipt(
                P2PMessageDataWithHash(hash_entry(&message)?, message_return),
                P2PMessageReceiptWithHash(hash_entry(&received_receipt)?, received_receipt),
            ))
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
fn receive_message(input: ReceiveMessageInput) -> ExternResult<P2PMessageReceipt> {
    let receipt = P2PMessageReceipt {
        id: vec![hash_entry(&input.0)?],
        status: Status::Delivered {
            timestamp: sys_time()?,
        },
    };
    let receipt_entry = Entry::App(receipt.clone().try_into()?);
    let message_entry = Entry::App(input.0.clone().try_into()?);
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            P2PMessage::entry_def().id,
            message_entry,
            ChainTopOrdering::Relaxed,
        ),
    )?;
    host_call::<CreateInput, HeaderHash>(
        __create,
        CreateInput::new(
            P2PMessageReceipt::entry_def().id,
            receipt_entry,
            ChainTopOrdering::Relaxed,
        ),
    )?;
    let message_return = P2PMessageData {
        author: input.0.author.clone(),
        receiver: input.0.receiver.clone(),
        payload: input.0.payload.clone(),
        time_sent: input.0.time_sent.clone(),
        reply_to: None,
    };

    let signal = Signal::Message(MessageSignal {
        message: MessageDataAndReceipt(
            P2PMessageDataWithHash(hash_entry(&input.0.clone())?, message_return),
            P2PMessageReceiptWithHash(hash_entry(&receipt.clone())?, receipt.clone()),
        ),
    });
    let signal_details = SignalDetails {
        name: "RECEIVE_P2P_MESSAGE".to_string(),
        payload: signal,
    };
    emit_signal(&signal_details)?;
    Ok(receipt)
}

#[hdk_extern]
fn get_all_messages(_: ()) -> ExternResult<P2PMessages> {
    let mut messages: Vec<P2PMessage> = Vec::default();
    let mut queried_messages: Vec<Element> = query(
        QueryFilter::new()
            .entry_type(EntryType::App(AppEntryType::new(
                EntryDefIndex::from(0),
                zome_info()?.zome_id,
                EntryVisibility::Private,
            )))
            .include_entries(true),
    )?;
    queried_messages.reverse();

    for element in queried_messages.into_iter() {
        let message: P2PMessage = element.try_into()?;
        messages.push(message)
    }
    Ok(P2PMessages(messages))
}
