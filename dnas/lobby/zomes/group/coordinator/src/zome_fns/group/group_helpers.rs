use group_integrity::LinkTypes;
use hdk::prelude::*;

use crate::signals::{SignalDetails, SignalName, SignalPayload};
use group_coordinator_types::group::GroupOutput;
use group_integrity_types::Group;

use crate::utils::{error, try_get_and_convert};

pub fn get_group_latest_version(group_id: EntryHash) -> ExternResult<GroupOutput> {
    /*
    1 - we have to get details from the recived entry_hash as arg (group_id),
    based in the details we get back for this function we should have one or other behavior
    */
    if let Some(details) = get_details(group_id.clone(), GetOptions::latest())? {
        match details {
            Details::Entry(group_entry_details) => {
                let group_updates_actions: Vec<Action> = group_entry_details
                    .updates
                    .iter()
                    .map(|action_hashed| -> Action { action_hashed.action().to_owned() })
                    .collect();

                /*
                CASE # 1 : if updates field for this entry is empty it means
                this entry has never been updated, so we can return this group version
                because we can assure this is the latest group version for the given group_id.
                */
                if group_updates_actions.is_empty() {
                    if let Entry::App(group_entry_bytes) = group_entry_details.entry {
                        let group_sb: SerializedBytes = group_entry_bytes.into_sb();
                        match TryInto::<Group>::try_into(group_sb) {
                            Ok(latest_group_version) => {
                                let group_output = GroupOutput {
                                    group_id,
                                    group_revision_id: group_entry_details.actions[0]
                                        .clone()
                                        .as_hash()
                                        .to_owned(),
                                    latest_name: latest_group_version.name,
                                    members: latest_group_version.members,
                                    creator: latest_group_version.creator,
                                    created: latest_group_version.created,
                                    avatar: latest_group_version.avatar,
                                };

                                return Ok(group_output);
                            }
                            Err(e) => return error(String::from(e)),
                        }
                    }
                }

                /*
                CASE # 2 : if the given entry has been updated we will loop through
                all the updates actions to get the most recent of them.
                */

                let group_root_action: Action = group_entry_details.actions[0].action().clone(); // here we storage the root action
                let mut latest_group_action: Action = group_root_action;

                for action in group_updates_actions {
                    if action.timestamp() > latest_group_action.timestamp() {
                        latest_group_action = action;
                    }
                }

                /*
                3 - having the latest action from this entry, we can get the updated information
                from this group using "hdk3::get"
                */
                if let Some(latest_group_entry_hash) = latest_group_action.entry_hash() {
                    let latest_group: Group = try_get_and_convert(
                        latest_group_entry_hash.to_owned(),
                        GetOptions::latest(),
                    )?;
                    let group_output = GroupOutput {
                        group_id,
                        group_revision_id: group_entry_details.actions[0]
                            .clone()
                            .as_hash()
                            .to_owned(),
                        latest_name: latest_group.name,
                        members: latest_group.members,
                        creator: latest_group.creator,
                        created: latest_group.created,
                        avatar: latest_group.avatar,
                    };
                    return Ok(group_output);
                }
            }
            _ => (), // unreachable
        } // match ends
    } // if let ends

    return error(String::from("failed to get the given group id"));
}

pub fn link_and_emit_added_to_group_signals(
    agents: Vec<AgentPubKey>,
    link_target: EntryHash,
    link_tag: LinkTag,
    signal_payload: SignalPayload,
) -> ExternResult<()> {
    for agent in agents.clone() {
        create_link(
            agent,
            link_target.clone(),
            LinkTypes::AgentToGroup,
            link_tag.clone(),
        )?;
    }

    let signal: SignalDetails = SignalDetails {
        name: SignalName::ADDED_TO_GROUP.to_owned(),
        payload: signal_payload,
    };

    match ExternIO::encode(signal) {
        Ok(input) => {
            remote_signal(input, agents)?;
            Ok(())
        }
        Err(e) => return error(String::from(e)),
    }
}
