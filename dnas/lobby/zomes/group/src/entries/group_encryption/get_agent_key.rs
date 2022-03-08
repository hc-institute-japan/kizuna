use super::IdentityKey;
use crate::utils::error;
use hdk::prelude::*;

pub fn get_agent_key_handler(agent: AgentPubKey) -> ExternResult<IdentityKey> {
    let links = get_links(agent.into(), Some(LinkTag::new("identity_key")))?;

    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::latest()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get_details(get_input))?;

    let get_output_result: Vec<Details> = get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .collect();

    // there should only be one
    if get_output_result.is_empty() {
        return error("No keys found");
    } else {
        let key_details = get_output_result[0].clone();
        match key_details {
            Details::Entry(key_details) => {
                if let Entry::App(_key_bytes) = key_details.entry.clone() {
                    let identity_key: IdentityKey = key_details.entry.try_into()?;
                    return Ok(identity_key);
                } else {
                    return error("This is a fatal error. Something is wrong with holochain. [get agent key 0]");
                }
            }
            _ => {
                return error(
                    "This is a fatal error. Something is wrong with holochain. [get agent key 1]",
                );
            }
        }
    }
}
