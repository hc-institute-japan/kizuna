#![allow(dead_code)]

use entries::request;
use request::{handlers, CapFor, Claims, Test};
mod entries;
use hdk3::prelude::*;

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    // grant unrestricted access to accept_cap_claim so other agents can send us claims
    let mut functions: GrantedFunctions = HashSet::new();
    functions.insert((zome_info!()?.zome_name, "accept_cap_claim".into()));

    let mut x: GrantedFunctions = HashSet::new();
    x.insert((zome_info!()?.zome_name, "receive_request".into()));

    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions,
    })?;
    create_cap_grant!(CapGrantEntry {
        tag: "".into(),
        access: ().into(),
        functions: x,
    })?;

    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
fn accept_cap_claim(claim: CapClaim) -> ExternResult<HeaderHash> {
    debug!("Starting accepting_cap_claim...")?;

    debug!("Ending accepting_cap_claim...")?;
    Ok(create_cap_claim!(claim)?)
}

#[hdk_extern]
pub fn cap_secret(_: ()) -> ExternResult<CapSecret> {
    Ok(generate_cap_secret!()?)
}

fn cap_grant_entry(secret: CapSecret) -> ExternResult<CapGrantEntry> {
    Ok(handlers::create_grant_entry(secret)?)
}

#[hdk_extern]
pub fn transferable_cap_grant(secret: CapSecret) -> ExternResult<HeaderHash> {
    Ok(create_cap_grant!(cap_grant_entry(secret)?)?)
}

#[hdk_extern]
pub fn roll_cap_grant(header_hash: HeaderHash) -> ExternResult<HeaderHash> {
    Ok(update_cap_grant!(
        header_hash,
        cap_grant_entry(generate_cap_secret!()?)?
    )?)
}

#[hdk_extern]
pub fn delete_cap_grant(header_hash: HeaderHash) -> ExternResult<HeaderHash> {
    Ok(delete_cap_grant!(header_hash)?)
}

#[hdk_extern]
fn needs_cap_claim(_: ()) -> ExternResult<()> {
    Ok(())
}

#[hdk_extern]
fn send_message(cap_for: CapFor) -> ExternResult<ZomeCallResponse> {
    Ok(handlers::send_message(cap_for)?)
}

#[hdk_extern]
fn send_request(agent: AgentPubKey) -> ExternResult<()> {
    Ok(handlers::send_request(agent)?)
}

#[hdk_extern]
fn receive_request(agent: AgentPubKey) -> ExternResult<()> {
    Ok(handlers::receive_request(agent)?)
}

#[hdk_extern]
fn get_cap_claims(_: ()) -> ExternResult<Claims> {
    debug!("Starting get_cap_claim...")?;
    let query_result = query!(QueryFilter::new().include_entries(true))?;

    debug!("the query results are... {:#?}", query_result)?;

    let cap_vector: Vec<CapClaim> = query_result
        .0
        .into_iter()
        .filter_map(|el| {
            let entry: Result<Option<CapClaim>, SerializedBytesError> =
                el.into_inner().1.to_app_option();
            match entry {
                Ok(Some(cap_claim)) => Some(cap_claim),
                _ => None,
            }
        })
        .collect();
    debug!("Ending get_cap_claim....")?;

    Ok(Claims(cap_vector))
}

#[hdk_extern]
fn is_updating(_: ()) -> ExternResult<Test> {
    Ok(Test {
        test: "nagbago2".to_owned(),
    })
}
