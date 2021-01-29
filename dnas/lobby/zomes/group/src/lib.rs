use hdk3::prelude::*;

mod entries;
mod utils;
mod signals; 

use entries::group;

use entries::group::{
    //TYPES USED IN CREATE GROUP: 
    Group,
    CreateGroupInput,
    MyGroupListWrapper,
    //TYPES USED IN ADD MEMEBERS: 
    AddMemberInput,
    AgentPubKeysWrapper,
    //TYPES USED IN UPDATE GROUP NAME
    UpdateGroupNameInput,
    //TYPES USED IN REMOVE MEMBERS: 
    RemoveMembersInput,
    //TYPES USED IN UTILS FUCNTIONS
    EntryHashWrapper,
    HashesOutput,

};


entry_defs![
    Group::entry_def(),
    Path::entry_def()
    ];

#[hdk_extern]
pub fn init(_:())-> ExternResult<InitCallbackResult> {

    let mut fuctions = HashSet::new();

    let tag:String = "create_group_cap_grant".into(); 
    let access:CapAccess = CapAccess::Unrestricted;
    
    let zome_name:ZomeName = zome_info()?.zome_name;
    let function_name:FunctionName = FunctionName("recv_remote_signal".into());
    
    fuctions.insert((zome_name, function_name));

    let cap_grant_entry:CapGrantEntry = CapGrantEntry::new(
        tag,//A string by which to later query for saved grants.
        access,//Unrestricted access means any external agent can call the extern
        fuctions,
    );

    create_cap_grant(cap_grant_entry)?;

    Ok(InitCallbackResult::Pass)
}
#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    emit_signal(&signal)?;
    Ok(())
}
//TO BE TESTED
#[hdk_extern]
fn create_group(create_group_input: CreateGroupInput)-> ExternResult<Group>{
    group::handlers::create_group(create_group_input)
}
#[hdk_extern]
fn validate_create_group(data:ValidateData)-> ExternResult<ValidateCallbackResult>{
    //data = { element = { signed_header, entry } , validation_package <Option> }

    //1- create is valid if creator pubkey matches the signature
    //2- create is valid if group name is not more than 50 characters ; create is valid if group name is at least one character long
    //3- cannot be empty and must at least include 2 pubkeys
    //4- creator AgentPubKey is not included here
    
    let agent_pub_key:AgentPubKey = agent_info()?.agent_latest_pubkey; 
    let entry_author_pub_key:AgentPubKey = data.element.header().author().clone();
    let entry:Option<Group> = data.element.entry().to_app_option()?.clone(); 

    if let Some(group) = entry {

        let group_name_length:usize = group.name.clone().len();
        let group_members_length:usize = group.get_group_members().len();

        if (agent_pub_key == entry_author_pub_key) &&  //(1)  
           (1 <= group_name_length && group_name_length <= 50) && //(2) 
           (2 <= group_members_length)&& //(3)
           (group.get_group_members().contains(&agent_pub_key))//(4)
        {
            return Ok(ValidateCallbackResult::Valid);
        }    
    }    

    Ok(ValidateCallbackResult::UnresolvedDependencies(vec![]))
}
#[hdk_extern]
fn add_members(add_member_input:AddMemberInput)->HdkResult<AgentPubKeysWrapper>{
    group::handlers::add_members(add_member_input)
}
#[hdk_extern]
fn update_group_name(update_group_name_input: UpdateGroupNameInput)-> ExternResult<HeaderHash>{
    group::handlers::update_group_name(update_group_name_input)
}
#[hdk_extern]
fn remove_members(remove_members_input: RemoveMembersInput)-> ExternResult<AgentPubKeysWrapper>{
    group::handlers::remove_members(remove_members_input)
}
//TO BE REVIEWED
#[hdk_extern]
fn get_all_my_groups(_:())->HdkResult<MyGroupListWrapper>{
    group::handlers::get_all_my_groups()
}


//UTILS FROM GROUP
#[hdk_extern]
fn get_group_entry_and_header_hash(input:Group)->ExternResult<HashesOutput>{
    group::handlers::get_group_entry_and_header_hash(input)
}
#[hdk_extern]
fn get_group_latest_vertion(group_id:EntryHashWrapper)->ExternResult<Group>{
    group::handlers::get_group_latest_vertion(group_id.group_hash)
}

