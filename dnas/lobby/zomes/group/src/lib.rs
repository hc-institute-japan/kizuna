#![allow(unused_imports)]// temporaly added

use hdk3::prelude::*;
use hdk3::prelude::element::ElementEntry;

mod entries;
mod utils;
mod test_utils;
mod signals;

use entries::group::{
    Group,
    GroupMembers,
    CreateGroupInput,
    GroupSecretKey,
    GroupListOutput,
};



use crate::signals::{
    SignalPayload
};

use crate::utils::to_timestamp;

use hdk3::prelude::link::Link;
use entries::group;

entry_defs![Group::entry_def(),GroupMembers::entry_def(), GroupSecretKey::entry_def(), Path::entry_def()];

#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    // when we send signals using fn remote_signal we first wrapped into a struct SignalDetails 
    emit_signal(&signal)?;
    Ok(())
}
#[hdk_extern]
fn create_group(create_group_input: CreateGroupInput) -> ExternResult<Group>{
    group::handlers::create_group(create_group_input)
} 
#[hdk_extern]
fn validate_create_group(data:ValidateData)-> ExternResult<ValidateCallbackResult>{
    //data = { element = { signed_header, entry } , validation_package <Option> }

    //1- create is valid if creator pubkey matches the signature
    //2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long

    let agent_pub_key:AgentPubKey = agent_info()?.agent_latest_pubkey; 
    let entry_author_pub_key:AgentPubKey = data.element.header().author().clone();
    let entry:Option<Group> = data.element.entry().to_app_option()?.clone(); 

    if let Some(group) = entry {

        if (agent_pub_key == entry_author_pub_key) &&  (1 <= group.name.len() && group.name.len() <= 50){
            
            return Ok(ValidateCallbackResult::Valid);

        }    
    }    

    Ok(ValidateCallbackResult::UnresolvedDependencies(vec![]))
}
#[hdk_extern]
fn get_needed_group_members_hashes(_:())->ExternResult<()>{
    group::handlers::get_needed_group_members_hashes(())?;
    Ok(())
}
#[hdk_extern]
fn get_all_groups(_:())->HdkResult<GroupListOutput>{
    group::handlers::get_all_groups(())
}




