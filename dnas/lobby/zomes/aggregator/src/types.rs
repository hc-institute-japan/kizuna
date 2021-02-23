use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;
use std::collections::hash_map::HashMap;
use std::time::SystemTime;

#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct EmptyPayload(pub String);
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct AgentPubKeys(pub Vec<AgentPubKey>);
// for username
#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
pub struct UsernameInfo {
    username: String,
    agent_id: AgentPubKey,
    created_at: Timestamp,
    entry_header_hash: HeaderHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct BatchSize(pub u8);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash, PartialEq, Eq, Debug)]
pub struct GroupMessageHash(pub EntryHash);
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct ReadList(pub HashMap<String, SystemTime>);
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageElement(pub Element);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessageContent(pub GroupMessageElement, pub ReadList);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessagesByGroup(pub HashMap<String, Vec<GroupMessageHash>>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessagesContents(pub HashMap<String, GroupMessageContent>);

// for group
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessagesOutput {
    messages_by_group: MessagesByGroup,
    group_messages_contents: GroupMessagesContents,
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
pub struct AggregatedLatestData {
    pub user_info: UsernameInfo,
    // retrieved from contacts zome
    pub added_contacts: Vec<AgentPubKey>,
    pub blocked_contacts: Vec<AgentPubKey>,
    // from group
    pub latest_group_messages: GroupMessagesOutput,
    //   // from p2pmessage
    //   latest_p2p_messages: P2PMessagesOutput,
}
