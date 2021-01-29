use hdk3::prelude::*;
use hdk3::prelude::link::Link;
use timestamp::Timestamp;

use crate::utils;
use crate::utils::to_timestamp;


use super::{
    //TYPES USED IN CREATE GROUP: 
    Group,
    CreateGroupInput,
    MyGroupListWrapper,
    //TYPES USED IN ADD MEMBERS: 
    AddMemberInput,
    AgentPubKeysWrapper,
    //TYPES USED IN UPDATE GROUP NAME:
    UpdateGroupNameInput,
    //TYPES USED IN REMOVE MEMBERS: 
    RemoveMembersInput,
    //TYPES USED IN UTILS FUNCTIONS:
    HashesOutput,
};

use crate::signals::{
    SignalDetails,
    SignalPayload,
};

pub fn create_group(create_group_input:CreateGroupInput)-> ExternResult<Group>{

    let group_name:String = create_group_input.name;
    let group_members:Vec<AgentPubKey> = create_group_input.members;
    let created:Timestamp = to_timestamp(sys_time()?);
    let creator:AgentPubKey = agent_info()?.agent_latest_pubkey;

    //get my blocked list from the contacs zome 
    let my_blocked_list:Vec<AgentPubKey> = utils::get_my_blocked_list()?.0; 

    //if even one member of the group its on mi blocked list we've to return an error
    for member in group_members.clone() {

        if my_blocked_list.contains(&member) {
            return Err(HdkError::Wasm(WasmError::Zome("cannot create group with blocked agents".into())));
        }
    }

    //commit group entry
    let group:Group = Group::new(
        group_name,
        created,
        creator.clone(),
        group_members.clone(),
    );

    let _group_header_hash = create_entry(&group.clone())?;
    let group_entry_hash:EntryHash = hash_entry(&group.clone())?;


   //create_link(creator.into(), group_entry_hash.clone(), LinkTag::new("member"))?; 

    //for all members: link from each member to Group entry tagged "member" 
    for member in group_members.clone() {
        create_link(
            member.into(),
            group_entry_hash.clone(),
            LinkTag::new("member"),
        )?;
    }

    // for all added agents: Send remote signal with Group EntryHash 
    let signal_payload:SignalPayload = SignalPayload::AddedToGroup(group_entry_hash); 
    let signal_name:String = "added_to_group".into();

    let signal:SignalDetails = SignalDetails{
        name: signal_name,
        payload: signal_payload,
    };

    remote_signal(
        &signal.clone(),
        group_members,
    )?;

    Ok(group)   
}
pub fn add_members(add_member_input: AddMemberInput) -> ExternResult<AgentPubKeysWrapper>{
    
    let mut new_group_members_from_input:Vec<AgentPubKey> = add_member_input.members;
    let group_id:EntryHash = add_member_input.group_id;
    let group_revision_id:HeaderHash = add_member_input.group_revision_id;

    //check whether members field is empty
    if new_group_members_from_input.is_empty() {
        return Err(HdkError::Wasm(WasmError::Zome("members field is empty".into())));
    }
    //check if any invitees are blocked and dont add blocked members to the group
    let my_blocked_list:Vec<AgentPubKey> = utils::get_my_blocked_list()?.0;

    for member in new_group_members_from_input.clone() {

        if my_blocked_list.contains(&member){
            return Err(HdkError::Wasm(WasmError::Zome("cannot create group with blocked agents".into())));
        }
    }

    //get most recent Group Entry
    let latest_group_vertion:Group = get_group_latest_vertion(group_id.clone())?;
    let mut group_members:Vec<AgentPubKey> =  latest_group_vertion.get_group_members();
    let creator:AgentPubKey = agent_info()?.agent_latest_pubkey;


    //this fucntion can only be called by the admin of the group
    if !creator.eq(&latest_group_vertion.get_group_creator()){
        return Err(HdkError::Wasm(WasmError::Zome("only the admin of the group can update the group information".into())));
    }

    //filter the list of members the admin want to add to avoid duplicated members(this probably its validated on ui but i added it here too)
    for new_member in new_group_members_from_input.clone(){
        if group_members.contains(&new_member) {
            return Err(HdkError::Wasm(WasmError::Zome("you're trying to add members who already belongs to this group".into())));
        }
    }
    //this var its used because append method leave empty the vector received as arg
    let new_group_members:Vec<AgentPubKey> =  new_group_members_from_input.clone();

    group_members.append(& mut new_group_members_from_input);

    let group_name:String = latest_group_vertion.name;
    let created:Timestamp = to_timestamp(sys_time()?);

    let updated_group:Group = Group::new(group_name, created, creator, group_members.clone());

    //update_entry the Group with new members field with original HeaderHash
    let _group_updated_header_hash:HeaderHash = update_entry(group_revision_id, &updated_group)?;


    //[for all newly added agents]
    for new_member in new_group_members_from_input.clone(){
        //link from each member to original Group entry tag "member"
        create_link(
            new_member.into(),
            group_id.clone(),
            LinkTag::new("member"),
        )?;

    }

    // for all added agents: Send remote signal with Group EntryHash 
    let signal_payload:SignalPayload = SignalPayload::AddedToGroup(group_id); 
    let signal_name:String = "added_to_group".into();

    let signal:SignalDetails = SignalDetails{
        name: signal_name,
        payload: signal_payload,
    };

    remote_signal(
        &signal.clone(),
        new_group_members,
    )?;


    Ok(AgentPubKeysWrapper(group_members))
}
pub fn update_group_name(update_group_name_input: UpdateGroupNameInput) -> ExternResult<HeaderHash>{

    let new_group_name:String = update_group_name_input.name;
    let group_header_hash:HeaderHash = update_group_name_input.group_revision_id;
    let group_entry_hash:EntryHash = update_group_name_input.group_id;


    //1- we've to get the latest group entry vertion for the recived entryhash (group_id)
    let latest_group_vertion:Group = get_group_latest_vertion(group_entry_hash.clone())?;
    //2-check whether the new name is the same with old name and return error if so
    let old_group_name:String = latest_group_vertion.name.clone();
    let created:Timestamp = to_timestamp(sys_time()?);
    let creator:AgentPubKey = agent_info()?.agent_latest_pubkey;
    let members:Vec<AgentPubKey> =  latest_group_vertion.get_group_members();

    if new_group_name.eq(&old_group_name){

        return Err(HdkError::Wasm(WasmError::Zome("no fields to update for this entry".into())));
    }

    let updated_group:Group = Group::new(new_group_name, created, creator, members);

    //we always update the entry from the root_group_header_hash, the header hash for this entry is provided as arg (group_hader_hash)
    //3-update_entry the Group with new name field with original HeaderHash
    let group_updated_header_hash:HeaderHash = update_entry(group_header_hash, &updated_group)?;


    Ok(group_updated_header_hash)
}
pub fn remove_members(remove_members_input: RemoveMembersInput)-> ExternResult<AgentPubKeysWrapper>{

    let members_to_remove:Vec<AgentPubKey> = remove_members_input.members;
    let group_id:EntryHash = remove_members_input.group_id;
    let group_revision_id:HeaderHash = remove_members_input.group_revision_id;
    
    //check whether members field is empty
    if members_to_remove.is_empty() {
        return Err(HdkError::Wasm(WasmError::Zome("members field is empty".into())));
    }
    //get most recent Group Entry
    let latest_group_vertion:Group = get_group_latest_vertion(group_id.clone())?;
    let mut group_members:Vec<AgentPubKey> =  latest_group_vertion.get_group_members();
    let creator:AgentPubKey = agent_info()?.agent_latest_pubkey;

    //this fucntion can only be called by the admin of the group
    if !creator.eq(&latest_group_vertion.get_group_creator()){
        return Err(HdkError::Wasm(WasmError::Zome("only the admin of the group can update the group information".into())));
    }
    //remove the members for the group members list
    for member in members_to_remove.clone(){
        group_members.retain(|group_member| !group_member.eq(&member));
    }
    //update_entry the Group with new members field with original HeaderHash
    let group_name:String = latest_group_vertion.name;
    let created:Timestamp = to_timestamp(sys_time()?);

    let updated_group:Group = Group::new(group_name, created, creator, group_members.clone());
    let _group_updated_header_hash:HeaderHash = update_entry(group_revision_id, &updated_group)?;


    //for all removed members we should delete the links between them and the group entry 
    for removed_member in members_to_remove{
        //get links for each removed member
        let groups_linked:Vec<Link> = get_links(removed_member.into(), Some(LinkTag::new("member")))?.into_inner();

        //filter all the groups linked to this agent to get the link between this group(group_id) and the agent(AgentPubKey)
        for link in groups_linked {

            if link.target.eq(&group_id) {
                //finnally when we find the link we have to delete it -- delete_link(add_link_header: HeaderHash) -> HdkResult<HeaderHash>
                delete_link(link.create_link_hash)?;
            }
        }
    }

    Ok(AgentPubKeysWrapper(group_members))
}
pub fn get_all_my_groups()->ExternResult<MyGroupListWrapper>{

    let my_pub_key:AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut my_linked_groups_entries:Vec<Group> = vec![];

    for link in get_links(my_pub_key.into(), Some(LinkTag::new("member")))?.into_inner(){

        if let Some(element) = get(link.target.clone(), GetOptions::latest())?{
            if let Some(group) = element.entry().to_app_option()?{

                my_linked_groups_entries.push(group);

            }
        }
    }

    let output: MyGroupListWrapper = MyGroupListWrapper(my_linked_groups_entries);

    Ok(output)
}


//UTILS FUNCTIONS 
pub fn get_group_entry_and_header_hash(input:Group)->ExternResult<HashesOutput>{

    let entry_hash:EntryHash = hash_entry(&input)?;

    if let Some(element) = get(entry_hash.clone(), GetOptions::content())?{    
        let header_hash:HeaderHash = element.header_address().to_owned();

        let output:HashesOutput = HashesOutput{
            header_hash,
            entry_hash,
        };

        return Ok(output);
    }

    return Err(HdkError::Wasm(WasmError::Zome("cannot get hashes for this group".into())));
} 
pub fn get_group_latest_vertion(group_id:EntryHash)->HdkResult<Group>{

    //1- we have to get details from the recived entry_hash as arg (group_id) 
         if let Some(details) = get_details(group_id.clone(), GetOptions::content())?{ // latest are trhown me an error (unreacheable)

            match details {

                Details::Entry(group_entry_details) => { 

                    //2- filter the latest Header (should be element)                 
                    let group_updates_headers:Vec<Header> = group_entry_details.updates.iter().map(|header_hashed|->Header{ header_hashed.header().to_owned() }).collect();
                    let group_root_header:Header = group_entry_details.headers[0].header().clone(); // here we storage the root header
                    
                    let mut latest_group_header:Header = group_root_header;

                    for header in group_updates_headers{

                        if header.timestamp() > latest_group_header.timestamp(){

                            latest_group_header = header;
                        }
                    }
                    //3- having the latest header from this entry, we can get the updated information from this group using "hdk3::get"
                    if let Some(latest_group_entry_hash) =  latest_group_header.entry_hash(){

                        if let Some(latest_group_element) = get(latest_group_entry_hash.clone(), GetOptions::latest())?{

                            let latest_group_vertion:Option<Group> = latest_group_element.entry().to_app_option()?;

                            if let Some(group) = latest_group_vertion {
                                return Ok(group);
                            }

                        }
                    }
                                    
                },
                _=>{ return Err(HdkError::Wasm(WasmError::Zome("element_details_type".into())));}

            }//match ends
            
        }//if let ends
        
    return Err(HdkError::Wasm(WasmError::Zome("we have an error search the entry information".into())));
}













