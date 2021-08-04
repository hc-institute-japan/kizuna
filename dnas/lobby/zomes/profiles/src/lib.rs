extern crate profiles;
use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;
use profiles::*;

#[hdk_extern]
fn get_agents_profile(agent_pub_keys: Vec<AgentPubKey>) -> ExternResult<Vec<AgentProfile>> {
    let mut agents_profile: Vec<AgentProfile> = Vec::default();

    for agent_pub_key in agent_pub_keys {
        let agent_address: AnyDhtHash = agent_pub_key.clone().into();

        let links = get_links(agent_address.into(), Some(link_tag("profile")?))?;

        let inner_links = links.into_inner();

        if inner_links.len() == 0 {
            // ignore agent pub keys that doesn't have a profile for now.
            continue;
        }

        let link = inner_links[0].clone();

        let profile: Profile = try_get_and_convert(link.target)?;

        let agent_profile = AgentProfile {
            agent_pub_key: AgentPubKeyB64::from(agent_pub_key),
            profile,
        };
        agents_profile.push(agent_profile)
    }
    Ok(agents_profile)
}
