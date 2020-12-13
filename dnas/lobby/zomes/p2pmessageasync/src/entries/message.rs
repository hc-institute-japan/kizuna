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
    reply_to: Option<EntryHash>,
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
pub struct MessageParameter {
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: String,
    time_sent: Timestamp,
    time_received: Option<Timestamp>,
    reply_to: Option<EntryHash>,
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
    pub fn from_parameter(message_parameter: MessageParameter, status: Status) -> Self {
        InboxMessageEntry {
            author: message_parameter.author,
            receiver: message_parameter.receiver,
            payload: message_parameter.payload,
            time_sent: message_parameter.time_sent,
            time_received: message_parameter.time_received,
            reply_to: message_parameter.reply_to,
            status: status
        }
    }
}

impl MessageParameter {
    pub fn from_inbox_entry(message_entry: InboxMessageEntry, status: Status) -> Self {
        MessageParameter {
            author: message_entry.author,
            receiver: message_entry.receiver,
            payload: message_entry.payload,
            time_sent: message_entry.time_sent,
            time_received: message_entry.time_received,
            reply_to: message_entry.reply_to,
            status: status
        }
    }
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessagesByAgent {
    author: AgentPubKey,
    messages: Vec<MessageParameter>
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageRange {
    author: AgentPubKey,
    last_message_timestamp_seconds: i64
}

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct BooleanWrapper(bool);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessageParameterOption(Option<MessageParameter>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessageListWrapper(Vec<MessageParameter>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct AgentListWrapper(Vec<AgentPubKey>);

#[derive(From, Into, Serialize, Deserialize, SerializedBytes)]
pub struct MessagesByAgentListWrapper(Vec<MessagesByAgent>);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct Reply {
    replied_message: MessageParameter,
    reply: String
}