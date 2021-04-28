use file_types::Payload;
use hdk::prelude::*;
use hdk::prelude::{element::SignedHeaderHashed, timestamp::Timestamp};
use std::collections::hash_map::HashMap;
use std::time::SystemTime;

// for contacts
#[derive(Deserialize, Serialize, SerializedBytes, Debug)]
pub struct AgentPubKeys(pub Vec<AgentPubKey>);

// for username
#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct UsernameInfo {
    username: String,
    agent_id: AgentPubKey,
    created_at: Timestamp,
    entry_header_hash: HeaderHash,
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct UsernameList(Vec<UsernameInfo>);

// for group
#[derive(Deserialize, Serialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupOutput {
    pub group_id: EntryHash,
    pub group_revision_id: HeaderHash,
    pub latest_name: String,
    pub members: Vec<AgentPubKey>,
    pub creator: AgentPubKey,
    pub created: Timestamp,
    // group_versions: Vec<Group>,
}

#[derive(Deserialize, Serialize, SerializedBytes, Debug)]
pub struct MyGroupListWrapper(pub Vec<GroupOutput>);

// for group chat
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct BatchSize(pub u8);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Hash, PartialEq, Eq, Debug)]
pub struct GroupMessageHash(pub EntryHash);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct ReadList(pub HashMap<String, SystemTime>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessage {
    // EntryHash of first ver of Group
    group_hash: EntryHash,
    payload: Payload,
    created: Timestamp,
    sender: AgentPubKey,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageElement {
    pub entry: GroupMessage,
    pub signed_header: SignedHeaderHashed,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageContent {
    pub group_message_element: GroupMessageElement,
    pub read_list: ReadList,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessagesByGroup(pub HashMap<String, Vec<GroupMessageHash>>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct GroupMessagesContents(pub HashMap<String, GroupMessageContent>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessagesOutput {
    messages_by_group: MessagesByGroup,
    group_messages_contents: GroupMessagesContents,
}

// for p2p chat
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct P2PMessage {
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: Payload,
    time_sent: Timestamp,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PMessageReceipt {
    id: EntryHash,
    status: Status,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum Status {
    Sent,
    Delivered { timestamp: Timestamp },
    Read { timestamp: Timestamp },
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct AgentMessages(HashMap<String, Vec<String>>);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct MessageBundle(P2PMessage, Vec<String>);
#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct MessageContents(HashMap<String, MessageBundle>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct ReceiptContents(HashMap<String, P2PMessageReceipt>);

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct P2PMessageHashTables(AgentMessages, MessageContents, ReceiptContents);

// for preference
#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Preference {
    typing_indicator: bool,
    read_receipt: bool,
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerAgentPreference {
    typing_indicator: Vec<AgentPubKey>,
    read_receipt: Vec<AgentPubKey>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PerGroupPreference {
    typing_indicator: Vec<String>,
    read_receipt: Vec<String>,
}

// the aggregated data from other zomes
#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct AggregatedLatestData {
    pub user_info: UsernameInfo,
    // for contacts
    pub added_contacts: Vec<AgentPubKey>,
    pub blocked_contacts: Vec<AgentPubKey>,
    // for group
    pub groups: MyGroupListWrapper,
    pub latest_group_messages: GroupMessagesOutput,
    pub member_profiles: UsernameList,
    // for p2pmessage
    pub latest_p2p_messages: P2PMessageHashTables,
    // for preference
    pub global_preference: Preference,
    pub per_agent_preference: PerAgentPreference,
    pub per_group_preference: PerGroupPreference,
}
