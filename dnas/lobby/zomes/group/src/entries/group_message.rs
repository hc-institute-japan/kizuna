#![allow(unused_imports)]
use hdk3::prelude::*;

use std::collections::hash_map::HashMap;
use timestamp::Timestamp;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash)]
pub struct _GroupMessageHash(pub EntryHash);

impl PartialEq for _GroupMessageHash {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}
impl Eq for _GroupMessageHash {}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash)]
pub struct _GroupEntryHash(pub EntryHash);

impl PartialEq for _GroupEntryHash {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}
impl Eq for _GroupEntryHash {}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _ReadList(pub HashMap<AgentPubKey, Timestamp>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessageElement(pub Element);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessageContent(pub _GroupMessageElement, pub _ReadList);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _MessagesByGroup(pub HashMap<_GroupEntryHash, Vec<_GroupMessageHash>>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessagesContents(pub HashMap<_GroupMessageHash, _GroupMessageContent>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct _GroupMessagesOutput(_MessagesByGroup, _GroupMessagesContents);

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub enum PayloadType {
    Text,
    File,
    All,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct GroupMsgBatchFetchFilter {
    group_id: EntryHash,
    // the last message of the last batch
    last_fetched: Option<EntryHash>,
    last_message_timestamp: Option<Timestamp>,
    // usize?
    batch_size: u8,
    payload_type: PayloadType,
}
