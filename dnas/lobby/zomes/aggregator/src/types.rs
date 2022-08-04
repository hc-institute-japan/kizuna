use file_types::Payload;
use hdk::prelude::*;
use hdk::prelude::{element::SignedHeaderHashed, timestamp::Timestamp};
// use holo_hash::{AgentPubKeyB64, EntryHashB64};
use std::collections::{hash_map::HashMap, BTreeMap};

// for profiles
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub nickname: String,
    pub fields: BTreeMap<String, String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AgentProfile {
    // pub agent_pub_key: AgentPubKeyB64,
    pub agent_pub_key: AgentPubKey,
    pub profile: Profile,
}

// for contacts
#[derive(Clone, Deserialize, PartialEq, Serialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CategoryWithId {
    // id: EntryHashB64,
    id: EntryHash,
    name: String,
}

#[derive(Clone, Deserialize, PartialEq, Serialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ContactOutput {
    // pub id: AgentPubKeyB64,
    pub id: AgentPubKey,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub category: Option<CategoryWithId>,
}

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
    pub avatar: Option<String>, // group_versions: Vec<Group>,
}

// for group chat
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
pub struct GroupMessageWithId {
    // entry_hash of GroupMessage
    pub id: EntryHash,
    pub content: GroupMessage,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageData {
    // EntryHash of first ver of Group
    group_hash: EntryHash,
    payload: Payload,
    created: Timestamp,
    sender: AgentPubKey,
    reply_to: Option<GroupMessageWithId>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageElement {
    pub entry: GroupMessageData,
    pub signed_header: SignedHeaderHashed,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessageContent {
    pub group_message_element: GroupMessageElement,
    pub read_list: HashMap<String, Timestamp>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupMessagesOutput {
    messages_by_group: HashMap<String, Vec<EntryHash>>,
    group_messages_contents: HashMap<String, GroupMessageContent>,
}

// for p2p chat
#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct P2PMessageReplyTo {
    hash: EntryHash,
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: Payload,
    time_sent: Timestamp,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct P2PMessageData {
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: Payload,
    time_sent: Timestamp,
    reply_to: Option<P2PMessageReplyTo>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PMessageReceipt {
    id: Vec<EntryHash>,
    status: Status,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum Status {
    Sent { timestamp: Timestamp },
    Delivered { timestamp: Timestamp },
    Read { timestamp: Timestamp },
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct P2PMessageHashTables(
    HashMap<String, Vec<String>>,                   // AgentMessages
    HashMap<String, (P2PMessageData, Vec<String>)>, // MessageContents
    HashMap<String, P2PMessageReceipt>,             // ReceiptContents
);

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
    pub user_info: Option<AgentProfile>,
    // for contacts
    pub added_contacts: Vec<ContactOutput>,
    pub blocked_contacts: Vec<ContactOutput>,
    pub added_profiles: Vec<AgentProfile>,
    pub blocked_profiles: Vec<AgentProfile>,
    // for group
    pub groups: Vec<GroupOutput>,
    pub latest_group_messages: GroupMessagesOutput,
    pub member_profiles: Vec<AgentProfile>,
    // for p2pmessage
    pub latest_p2p_messages: P2PMessageHashTables,
    // for preference
    pub global_preference: Preference,
    pub per_agent_preference: PerAgentPreference,
    pub per_group_preference: PerGroupPreference,
}
