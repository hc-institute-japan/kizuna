use hdk3::prelude::timestamp::Timestamp;
use hdk3::prelude::*;

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

#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
pub struct AggregatedLatestData {
    pub user_info: UsernameInfo,
    // retrieved from contacts zome
    pub added_contacts: Vec<AgentPubKey>,
    pub blocked_contacts: Vec<AgentPubKey>,
    //   // from group
    //   latest_group_messages: GroupMessagesOutput,
    //   // from p2pmessage
    //   latest_p2p_messages: P2PMessagesOutput,
}
