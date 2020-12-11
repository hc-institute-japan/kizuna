use hdk3::prelude::*;
use derive_more::{From, Into};
use crate::{timestamp::Timestamp};

pub mod handlers;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub enum Status {
    Sent, // the message has been transmitted to the network
    Delivered, // the message has successfully traversed the network and reached the receiver
    Read, // the message has been opened by the receiver
    Failed
}

#[hdk_entry(id = "message", visibility = "public")]
pub struct InboxMessageEntry {
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: String,
    time_sent: Timestamp,
    time_received: Option<Timestamp>,
    status: Status
}

#[hdk_entry(id = "inbox", visibility = "public")]
// #[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct Inbox {
    owner: AgentPubKey,
    tag: String
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageInput {
    receiver: AgentPubKey, 
    payload: String
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageOutput {
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: String,
    time_sent: Timestamp,
    time_received: Option<Timestamp>,
    status: Status
}

impl Inbox {
    pub fn new(agent_pubkey: AgentPubKey) -> Self {
        Inbox {
            owner: agent_pubkey,
            tag: "inbox".to_string()
        }
    }
}

impl InboxMessageEntry {
    pub fn from_output(message_output: MessageOutput, status: Status) -> Self {
        InboxMessageEntry {
            author: message_output.author,
            receiver: message_output.receiver,
            payload: message_output.payload,
            time_sent: message_output.time_sent,
            time_received: message_output.time_received,
            status: status
        }
    }
}

impl MessageOutput {
    pub fn from_inbox_entry(message_entry: InboxMessageEntry, status: Status) -> Self {
        MessageOutput {
            author: message_entry.author,
            receiver: message_entry.receiver,
            payload: message_entry.payload,
            time_sent: message_entry.time_sent,
            time_received: message_entry.time_received,
            status: status
        }
    }
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessagesByAgent {
    author: AgentPubKey,
    messages: Vec<MessageOutput>
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageRange {
    author: AgentPubKey,
    last_message_timestamp_seconds: i64
}

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct BooleanWrapper(bool);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessageOutputOption(Option<MessageOutput>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessageListWrapper(Vec<MessageOutput>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct AgentListWrapper(Vec<AgentPubKey>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessagesByAgentListWrapper(Vec<MessagesByAgent>);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct Claims(Vec<CapClaim>);