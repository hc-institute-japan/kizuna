use hdk3::prelude::*;
mod entries;
mod utils;
use entries::message;

use message::{
    InboxMessageEntry,
    Inbox,
    MessageInput,
    MessageParameter,
    MessageListWrapper,
    BooleanWrapper,
    Reply
};

entry_defs![
    InboxMessageEntry::entry_def(),
    Inbox::entry_def()
];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(HdkError::Wasm(WasmError::Zome(String::from(reason))))
}

#[hdk_extern]
fn send_message_async(message_input: MessageInput) -> ExternResult<MessageParameter> {
    message::handlers::send_message_async(message_input)
}

#[hdk_extern]
fn fetch_inbox(_: ()) -> ExternResult<MessageListWrapper> {
    message::handlers::fetch_inbox()
}

#[hdk_extern]
fn notify_delivery(message_input: MessageParameter) -> ExternResult<BooleanWrapper> {
    message::handlers::notify_delivery(message_input)
}

#[hdk_extern]
fn reply_to_message(reply_input: Reply) -> ExternResult<MessageParameter> {
    message::handlers::reply_to_message(reply_input)
}