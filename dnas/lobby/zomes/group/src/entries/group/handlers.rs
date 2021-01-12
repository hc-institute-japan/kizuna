use hdk3::prelude::*;
use holochain_zome_types::*;
use super::{
    Group,
    GroupMembers,
    GroupSecretKey,
    CreateGroupInput,
    AddInitialMembersInput,
    SecretHash,
};


use crate::signals::{

    SignalDetails,
    SignalGroupMembersData
};

use crate::utils::to_timestamp;

pub(crate)fn create_group(create_group_input: CreateGroupInput )->ExternResult<Group>{


    let group_name : String = create_group_input.name;
    let group_members : Vec<AgentPubKey> = create_group_input.members;

    if  !(group_name.eq(& String::from("")) || group_members.len() < 2) {
        
        let group:Group = Group{
            name: group_name,
            created: to_timestamp(sys_time()?),
            creator: agent_info()?.agent_latest_pubkey,
        };
        
        // commit group entry
        create_entry(&group.clone())?;
        
        // call `TryFromRandom` to generate symmetric key
        let key_hash: XSalsa20Poly1305KeyRef = SecretBoxKeyRef:: try_from_random()?;

        let group_secret_key: GroupSecretKey = GroupSecretKey{
            group_hash: hash_entry(&group.clone())?,
            key_hash: key_hash.clone(),
        };    

        //store the encrypted secret key on source chain
        create_entry(&group_secret_key.clone())?;
        
        //call fn add_initial_members(add_members_input)
        add_initial_members(AddInitialMembersInput{
            invitee: group_members,
            group_entry_hash: hash_entry(&group.clone())?,
            secret_hash: SecretHash(key_hash),
        })?;


        return Ok(group);
    }

    Err(HdkError::Wasm(WasmError::Zome(String::from("error"))))
}

pub fn add_initial_members(add_member_input:AddInitialMembersInput) ->ExternResult<HeaderHash>{

    let group_hash:EntryHash = add_member_input.group_entry_hash;
    let secret_hash:SecretHash = add_member_input.secret_hash;
    let members:Vec<AgentPubKey> = add_member_input.invitee;

    //initialize GroupMembers with args given
    let group_members:GroupMembers = GroupMembers{
        group_hash:group_hash.clone(),
        secret_hash:secret_hash,
        members:members.clone(),
    };

    //commit GroupMembers entry with members
    let group_members_header_hash = create_entry(&group_members.clone())?;
    let group_members_entry_hash = hash_entry(&group_members.clone())?;


    //link Group -> GroupMembers tag "members
    create_link(
        group_hash,
        group_members_entry_hash.clone(),
        LinkTag::new("members"),
    )?;

    //link from the GroupMembers to own pubkey with tag "keyholder"
    create_link(
        group_members_entry_hash.clone(),
        agent_info()?.agent_latest_pubkey.into(),
        LinkTag::new("keyholder"),

    )?;     

    //[for all newly added agent]
    //link from each member to GroupMembers entry tag "member"
    for agent in members.clone(){

        create_link(
            agent.into(),
            group_members_entry_hash.clone(),
            LinkTag::new("member")
        )?;
    }

    //[for all added agents]
    //send remote signal with GroupMembers entry hash
    
    let signal_group_members_data = SignalGroupMembersData::new(group_members_entry_hash)?;    

    remote_signal(
        &signal_group_members_data,
        members,
    )?;

    Ok(group_members_header_hash)
}

