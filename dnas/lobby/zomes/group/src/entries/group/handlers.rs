use hdk3::prelude::*;
use hdk3::prelude::link::Link;
use timestamp::Timestamp;

use crate::utils;
use crate::utils::to_timestamp;


use super::{
    //TYPES USED IN CREATE GROUP: 
    Group,
    CreateGroupInput,
    CreateGroupOutput,
    //TYPES USED IN ADD MEMBERS AND REMOVE MEMBERS: 
    UpdateMembersIO,
    //TYPES USED IN UPDATE GROUP NAME:
    UpdateGroupNameIO,
    //TYPES USED IN GET ALL MY GROUPS
    GroupOutput,
    MyGroupListWrapper,
    //TYPES USED IN UTILS FUNCTIONS:
    HashesOutput,
};

use crate::signals::{
    SignalDetails,
    SignalPayload,
};

pub fn create_group(create_group_input: CreateGroupInput) -> ExternResult<CreateGroupOutput> {

    let group_name: String = create_group_input.name;
    let group_members: Vec<AgentPubKey> = create_group_input.members;
    let created: Timestamp = to_timestamp(sys_time()?);
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;

    // get my blocked list from the contacs zome 
    let my_blocked_list: Vec<AgentPubKey> = utils::get_my_blocked_list()?.0; 

    // if even one member of the group is in my blocked list we have to return an error
    for member in group_members.clone() {
        if my_blocked_list.contains(&member) {
            return Err(HdkError::Wasm(WasmError::Zome("cannot create group with blocked agents".into())));
        }
    }

    let group: Group = Group::new(
        group_name,
        created,
        creator.clone(),
        group_members.clone(),
    );

    // commit group entry
    let group_revision_id: HeaderHash = create_entry(&group.clone())?;
    let group_id: EntryHash = hash_entry(&group.clone())?;

    // link the group admin to the group 
    create_link(creator.into(), group_id.clone(), LinkTag::new("member"))?;
    
    let signal_payload: SignalPayload = SignalPayload::AddedToGroup(group_id.clone()); 
    // link all the group members to the group entry with the link tag "member" and send them a signal with the group_id as payload. 
    link_and_emit_signals(group_members, group_id.clone(), LinkTag::new("member"), signal_payload)?;

    Ok(CreateGroupOutput{
        content: group,
        group_id: group_id,
        group_revision_id: group_revision_id,
    })   
}

pub fn add_members(add_members_input: UpdateMembersIO) -> ExternResult<UpdateMembersIO> {
    
    let mut new_group_members_from_input: Vec<AgentPubKey> = add_members_input.members.clone();
    let group_id: EntryHash = add_members_input.group_id.clone();
    let group_revision_id: HeaderHash = add_members_input.group_revision_id.clone();

    // check whether members field is empty 
    if new_group_members_from_input.is_empty() {
        return Err(HdkError::Wasm(WasmError::Zome("members field is empty".into())));
    }

    //check if any invitees are blocked and return Err if so.
    let my_blocked_list: Vec<AgentPubKey> = utils::get_my_blocked_list()?.0;

    for member in new_group_members_from_input.clone() {

        if my_blocked_list.contains(&member){
            return Err(HdkError::Wasm(WasmError::Zome("cannot create group with blocked agents".into())));
        }
    }

    // get most recent Group Entry
    let latest_group_version: Group = get_group_latest_version(group_id.clone())?;
    let mut group_members: Vec<AgentPubKey> =  latest_group_version.get_group_members();
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;


    // filter the list of members the admin want to add to avoid duplicated members
    new_group_members_from_input.retain(|new_member| !group_members.contains(&new_member) );

    // this var is needed because append method leave empty the vector received as arg
    let new_group_members:Vec<AgentPubKey> =  new_group_members_from_input.clone();

    group_members.append(& mut new_group_members_from_input);

    let group_name: String = latest_group_version.name;
    let created: Timestamp = to_timestamp(sys_time()?);

    let updated_group: Group = Group::new(group_name, created, creator, group_members.clone());

    // update_entry the Group with new members field with original HeaderHash
    update_entry(group_revision_id, &updated_group)?;

    let signal_payload: SignalPayload = SignalPayload::AddedToGroup(group_id.clone());

    //link all the new group members to the group entry with the link tag "member" and send them a signal with the group_id as payload 
    link_and_emit_signals(new_group_members, group_id, LinkTag::new("member"), signal_payload)?;

    Ok(add_members_input)
}

pub fn remove_members(remove_members_input: UpdateMembersIO)-> ExternResult<UpdateMembersIO> {

    let members_to_remove: Vec<AgentPubKey> = remove_members_input.members.clone();
    let group_id: EntryHash = remove_members_input.group_id.clone();
    let group_revision_id: HeaderHash = remove_members_input.group_revision_id.clone();
    
    // check whether members field is empty
    if members_to_remove.is_empty() {
        return Err(HdkError::Wasm(WasmError::Zome("members field is empty".into())));
    }

    // get most recent Group Entry
    let latest_group_version: Group = get_group_latest_version(group_id.clone())?;
    let mut group_members: Vec<AgentPubKey> =  latest_group_version.get_group_members();
    
    // remove the members for the group members list
    group_members.retain(|member| !members_to_remove.contains(&member) );
    
    // update_entry the Group with new members field using the  original HeaderHash
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let group_name: String = latest_group_version.name;
    let created: Timestamp = to_timestamp(sys_time()?);

    let updated_group: Group = Group::new(group_name, created, creator, group_members.clone());
    
    update_entry(group_revision_id, &updated_group)?;

    // for all removed members we should delete the links between them and the group entry 
    for removed_member in members_to_remove{
        // get links for each removed member
        // TODO: see if looping through all links here is too much of an overload and change implementation if necessary.
        let groups_linked: Vec<Link> = get_links(removed_member.into(), Some(LinkTag::new("member")))?.into_inner();

        // filter all the groups linked to this agent to get the link between this group(group_id) and the agent(AgentPubKey)
        for link in groups_linked {

            if link.target.eq(&group_id) {
                // finally when we find the link we have to delete it -- delete_link(add_link_header: HeaderHash) -> HdkResult<HeaderHash>
                delete_link(link.create_link_hash)?;
            }
        }
    }

    Ok(remove_members_input)
}

pub fn update_group_name(update_group_name_input: UpdateGroupNameIO) -> ExternResult<UpdateGroupNameIO> {

    let new_group_name: String = update_group_name_input.name.clone();
    let group_revision_id: HeaderHash = update_group_name_input.group_revision_id.clone();
    let group_id: EntryHash = update_group_name_input.group_id.clone();


    // 1 - we've to get the latest group entry version for the recived entryhash (group_id)
    let latest_group_version: Group = get_group_latest_version(group_id)?;
    
    // 2 - check whether the new name is the same with old name and return error if so    
    let old_group_name:String = latest_group_version.name.clone();
    if new_group_name.eq(&old_group_name){
        return Err(HdkError::Wasm(WasmError::Zome("the new name and old name of the group are the same.".into())));
    }

    let created: Timestamp = to_timestamp(sys_time()?);
    let creator: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let members: Vec<AgentPubKey> =  latest_group_version.get_group_members();

    let updated_group: Group = Group::new(new_group_name, created, creator, members);

    // we always update the entry from the root_group_header_hash, the header hash for this entry is provided as arg (group_revision_id)
    // 3 - update_entry the Group with new name field using original HeaderHash
    update_entry(group_revision_id, &updated_group)?;

    Ok(update_group_name_input)
}

pub fn get_all_my_groups()->ExternResult<MyGroupListWrapper> {

    let my_pub_key: AgentPubKey = agent_info()?.agent_latest_pubkey;
    let mut my_linked_groups_entries: Vec<GroupOutput> = vec![];
    let mut group_id: EntryHash;
    let mut group_revision_id: HeaderHash;
    let mut group: Group; 

    for link in get_links(my_pub_key.into(), Some(LinkTag::new("member")))?.into_inner() {

        if let Some(element) = get(link.target.clone(), GetOptions::latest())? {

            group_id = link.target.clone();
            group_revision_id = element.header_address().to_owned();
            group = get_group_latest_version(link.target.clone())?;
    
            my_linked_groups_entries.push(GroupOutput::new(group, group_id, group_revision_id));        
        }   
    }

    let output: MyGroupListWrapper = MyGroupListWrapper(my_linked_groups_entries);

    Ok(output)
}

// UTILS FUNCTIONS 
pub fn get_group_entry_and_header_hash(input:Group)->ExternResult<HashesOutput> {

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

pub fn get_group_latest_version(group_id: EntryHash) -> ExternResult<Group> {
    
    // 1 - we have to get details from the recived entry_hash as arg (group_id), based in the details we get back for this function  we should have one or other behavior
    if let Some(details) = get_details(group_id.clone(), GetOptions::latest())? {

        match details {

            Details::Entry(group_entry_details) => { 

                let group_updates_headers: Vec<Header> = group_entry_details.updates.iter().map(|header_hashed| -> Header{ header_hashed.header().to_owned() }).collect();


                // CASE # 1 : if the updates field for this entry its empty it means this entry never has been updated, so we can return this group version because we can assure this is the latest group version for the given group_id.
                if group_updates_headers.is_empty() {

                    if let Entry::App(group_entry_bytes) = group_entry_details.entry {

                        let group_sb = group_entry_bytes.into_sb();
                        let latest_group_version: Group = group_sb.try_into()?;

                        return Ok(latest_group_version);

                    }

                }else {

                 // CASE # 2 : if the given entry has been updated we will loop through all the updates headers to get the most recent of them. 

                    let group_root_header: Header = group_entry_details.headers[0].header().clone(); // here we storage the root header
                    let mut latest_group_header: Header = group_root_header;
                    
                    for header in group_updates_headers{
    
                        if header.timestamp() > latest_group_header.timestamp(){
    
                            latest_group_header = header;
                        }
                    }
    
                    // 3 - having the latest header from this entry, we can get the updated information from this group using "hdk3::get"
                    if let Some(latest_group_entry_hash) =  latest_group_header.entry_hash() {
    
                        if let Some(latest_group_element) = get(latest_group_entry_hash.clone(), GetOptions::content())? {
    
                            let latest_group_version: Option<Group> = latest_group_element.entry().to_app_option()?;
    
                            if let Some(group) = latest_group_version {
                                return Ok(group);
                            }
    
                        }
                    }   
                }// end of else statement
            },
            // this case will not happen
            _ => (return Err(HdkError::Wasm(WasmError::Zome("wierd error".into()))))

        } // match ends
    } // if let ends
        
    return Err(HdkError::Wasm(WasmError::Zome("the given group_id does not exist".into())));
}

pub fn link_and_emit_signals(agents: Vec<AgentPubKey>, link_target: EntryHash, link_tag: LinkTag, signal_payload: SignalPayload) -> HdkResult<()> {

    for agent in agents.clone(){

        create_link(
            agent.into(),
            link_target.clone(),
            link_tag.clone(),
        )?;

    }

    let signal_name: String;

    match signal_payload.clone() {
        SignalPayload::AddedToGroup(_) => {
            signal_name = "added_to_group".into();
        },
        
    }

    let signal: SignalDetails = SignalDetails {
        name: signal_name,
        payload: signal_payload,
    };
    
    remote_signal(
        &signal.clone(),
        agents,
    )?;

    Ok(())
}

pub fn get_group_entry_from_element(element: Element) -> HdkResult<Group> {
 
    if let Some(group) = element.entry().to_app_option()? {
        return Ok(group)
    }
    return Err(HdkError::Wasm(WasmError::Zome("we can't get the entry for the given element".into())));
}












