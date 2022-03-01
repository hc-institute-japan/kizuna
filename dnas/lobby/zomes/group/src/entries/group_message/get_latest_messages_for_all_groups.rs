use hdk::prelude::*;

use file_types::PayloadType;
use std::collections::hash_map::HashMap;

use super::get_previous_group_messages::get_previous_group_messages_handler;

use super::{GroupMessageContent, GroupMessagesOutput, GroupMsgBatchFetchFilter};

pub fn get_latest_messages_for_all_groups_handler(
    batch_size: u8,
) -> ExternResult<GroupMessagesOutput> {
    let batch_size: u8 = batch_size;

    // initialize MessagesByGroup
    let mut messages_by_group: HashMap<String, Vec<EntryHash>> = HashMap::new();

    // initialize GroupMessagesContents HashMap
    let mut messages_contents: HashMap<String, GroupMessageContent> = HashMap::new();

    // get_links agent_pubkey->group|member| (group_hash)
    let agent_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let linked_groups_to_the_agent: Vec<EntryHash> =
        get_links(agent_pub_key.into(), Some(LinkTag::new("member")))?
            .into_iter()
            .map(|link_to_group| -> EntryHash { link_to_group.target })
            .collect();

    // for each group in the list call fetch_next_batch_group_messages() with payload_type All last_fetched/last_message_timestamp as None

    debug!(
        "nicko get latest messages # of groups: {:?}",
        linked_groups_to_the_agent.clone().len()
    );
    for group_id in linked_groups_to_the_agent.into_iter() {
        debug!("nicko fetching messages from group {:?}", group_id.clone());
        let batch_filter: GroupMsgBatchFetchFilter = GroupMsgBatchFetchFilter {
            group_id: group_id,
            last_fetched: None,
            last_message_timestamp: None,
            batch_size: batch_size.clone(),
            payload_type: PayloadType::All,
        };

        let mut messages_output: GroupMessagesOutput =
            get_previous_group_messages_handler(batch_filter)?;

        // insert GroupMessagesContents and MessagesByGroup values from returned GroupMessagesOutput into the initialized MessagesByGroup and GroupMessagesContents
        for (key, value) in messages_output.messages_by_group.drain() {
            messages_by_group.insert(key, value);
        }

        for (key, value) in messages_output.group_messages_contents.drain() {
            messages_contents.insert(key, value);
        }
    }

    // construct GroupMessagesOutput

    let output: GroupMessagesOutput = GroupMessagesOutput {
        messages_by_group: messages_by_group,
        group_messages_contents: messages_contents,
    };
    debug!("nicko get latest messages returning");

    Ok(output)
}
