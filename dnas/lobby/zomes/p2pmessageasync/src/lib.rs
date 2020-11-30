use hdk3::prelude::*;
mod entries;
mod utils;
use entries::message;

use message::{
    MessageEntry,
    InboxMessageEntry,
    Inbox,
    Outbox,
    MessageInput,
    MessageOutput,
    MessageListWrapper,
    MessageOutputOption
};

entry_defs![
    MessageEntry::entry_def(),
    InboxMessageEntry::entry_def(),
    Inbox::entry_def(),
    Outbox::entry_def()
];

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(HdkError::Wasm(WasmError::Zome(String::from(reason))))
}

#[hdk_extern]
fn send_message_async(message_input: MessageInput) -> ExternResult<MessageOutput> {
    message::handlers::send_message_async(message_input)
}

#[hdk_extern]
fn fetch_inbox(_: ()) -> ExternResult<MessageListWrapper> {
    message::handlers::fetch_inbox()
}

#[hdk_extern]
fn fetch_outbox(_: ()) -> ExternResult<MessageListWrapper> {
    message::handlers::fetch_outbox()
}

#[hdk_extern]
fn acknowledge_async(message_input: MessageOutput) -> ExternResult<MessageOutputOption> {
    message::handlers::acknowledge_async(message_input)
}