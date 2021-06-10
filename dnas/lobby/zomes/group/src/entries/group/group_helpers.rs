use hdk::prelude::*;

use super::{Group, GroupOutput};
use crate::signals::{SignalDetails, SignalName, SignalPayload};

use crate::utils::error;

pub fn get_group_latest_version(group_id: EntryHash) -> ExternResult<GroupOutput> {
    // 1 - we have to get details from the recived entry_hash as arg (group_id), based in the details we get back for this function we should have one or other behavior
    if let Some(details) = get_details(group_id.clone(), GetOptions::latest())? {
        match details {
            Details::Entry(group_entry_details) => {
                let group_updates_headers: Vec<Header> = group_entry_details
                    .updates
                    .iter()
                    .map(|header_hashed| -> Header { header_hashed.header().to_owned() })
                    .collect();

                // CASE # 1 : if updates field for this entry is empty it means this entry has never been updated, so we can return this group version because we can assure this is the latest group version for the given group_id.
                if group_updates_headers.is_empty() {
                    if let Entry::App(group_entry_bytes) = group_entry_details.entry {
                        let group_sb: SerializedBytes = group_entry_bytes.into_sb();
                        let latest_group_version: Group = group_sb.try_into()?;
                        let group_output = GroupOutput {
                            group_id,
                            group_revision_id: group_entry_details.headers[0]
                                .clone()
                                .as_hash()
                                .to_owned(),
                            latest_name: latest_group_version.name,
                            members: latest_group_version.members,
                            creator: latest_group_version.creator,
                            created: latest_group_version.created,
                        };

                        return Ok(group_output);
                    }
                }

                // CASE # 2 : if the given entry has been updated we will loop through all the updates headers to get the most recent of them.

                let group_root_header: Header = group_entry_details.headers[0].header().clone(); // here we storage the root header
                let mut latest_group_header: Header = group_root_header;

                for header in group_updates_headers {
                    if header.timestamp() > latest_group_header.timestamp() {
                        latest_group_header = header;
                    }
                }

                // 3 - having the latest header from this entry, we can get the updated information from this group using "hdk3::get"
                if let Some(latest_group_entry_hash) = latest_group_header.entry_hash() {
                    if let Some(latest_group_element) =
                        get(latest_group_entry_hash.clone(), GetOptions::content())?
                    {
                        let latest_group_version: Option<Group> =
                            latest_group_element.entry().to_app_option()?;

                        if let Some(group) = latest_group_version {
                            let group_output = GroupOutput {
                                group_id,
                                group_revision_id: group_entry_details.headers[0]
                                    .clone()
                                    .as_hash()
                                    .to_owned(),
                                latest_name: group.name,
                                members: group.members,
                                creator: group.creator,
                                created: group.created,
                            };
                            return Ok(group_output);
                        }
                    }
                }
            }
            _ => (), // this case will not happen
        } // match ends
    } // if let ends

    return error("failed to get the given group id");
}

pub fn link_and_emit_added_to_group_signals(
    agents: Vec<AgentPubKey>,
    link_target: EntryHash,
    link_tag: LinkTag,
    signal_payload: SignalPayload,
) -> ExternResult<()> {
    for agent in agents.clone() {
        create_link(agent.into(), link_target.clone(), link_tag.clone())?;
    }

    let signal: SignalDetails = SignalDetails {
        name: SignalName::ADDED_TO_GROUP.to_owned(),
        payload: signal_payload,
    };

    remote_signal(ExternIO::encode(signal)?, agents)?;

    Ok(())
}
pub fn get_group_entry_from_element(element: Element) -> ExternResult<Group> {
    if let Some(group) = element.entry().to_app_option()? {
        return Ok(group);
    }
    return error("we can't get the entry for the given element");
}
