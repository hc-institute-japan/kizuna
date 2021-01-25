use hdk3::prelude::*;
use holochain_zome_types::*;
use hdk3::prelude::element::ElementEntry;
use hdk3::prelude::element::SignedHeaderHashed;

use super::{
    Group,
    GroupMembers,
    GroupSecretKey,
    GroupListOutput,
    CreateGroupInput,
    AddInitialMembersInput,
    SecretHash,
    HashesWrapper,
    //Secrets,
};


use crate::signals::{

    SignalDetails,
    SignalGroupMembersData,
};

use crate::utils::to_timestamp;

use hdk3::prelude::link::Link;


pub fn create_group(create_group_input: CreateGroupInput )->ExternResult<Group>{

    let group_name : String = create_group_input.name;
    let creator:AgentPubKey = agent_info()?.agent_latest_pubkey;
    let group_members:Vec<AgentPubKey> = create_group_input.members;
      
    let group:Group = Group{
        name: group_name,
        created: to_timestamp(sys_time()?),
        creator: creator.clone(),
    };

    // we should validate the input before we commit any entry into the dht/source_chain
    // this validation its added here could be changed on future into a formal validation rule
    // group_members validation: 
    // creator AgentPubKey is not included here  
    // cannot be empty and must at least include 2 pubkeys
    // should i add validation to avoid duplicated data // or this is guaranted on front_end? -> TATS: will talk about this in the meeting. 

    // TATS: we also need to check whether the member field has anyone who the creator of the group blocked.
    // To do this, just use the call() API to the contacts zome. Please call the list_blocked() in contacts
    // and it will return you a Vec<AgenPubKey>. As written in the architecture of create_group(), please return Err
    // if even one member is blocked. 
        
        if group_members.contains(&creator.clone()) || ( group_members.len() < 2 ) {

            return Err(HdkError::Wasm(WasmError::Zome(String::from("the group_members list from the input dont have a valid format, the group creation failed "))));

        } 

    // commit group entry
    create_entry(&group.clone())?;
    
    //Path(all_groups)->group
    let group_entry_hash:EntryHash = hash_entry(&group.clone())?;
    let all_groups_path_hash:EntryHash = get_all_groups_path()?;

    create_link(all_groups_path_hash, group_entry_hash.clone(), LinkTag::new("group"))?; 
    
    // call `TryFromRandom` to generate symmetric key
    let key_hash: XSalsa20Poly1305KeyRef = SecretBoxKeyRef::try_from_random()?; 
    
    let group_secret_key: GroupSecretKey = GroupSecretKey{
        group_hash: group_entry_hash.clone(),
        key_hash: key_hash.clone(),
    };    

    // store the encrypted secret key on source chain
    create_entry(&group_secret_key.clone())?;
    
    // call fn add_initial_members(add_members_input)
    add_initial_members(AddInitialMembersInput{
        invitee: group_members,
        group_entry_hash: group_entry_hash,
        secret_hash: SecretHash(key_hash),
    })?;

    Ok(group)    
}
pub fn add_initial_members(add_member_input:AddInitialMembersInput) ->ExternResult<HeaderHash>{

    let group_hash: EntryHash = add_member_input.group_entry_hash;
    let secret_hash: SecretHash = add_member_input.secret_hash;
    let members: Vec<AgentPubKey> = add_member_input.invitee;

    //initialize GroupMembers with args given
    let group_members: GroupMembers = GroupMembers{
        group_hash: group_hash.clone(),
        secret_hash: secret_hash,
        members: members.clone(),
    };

    // commit GroupMembers entry with members
    let group_members_header_hash = create_entry(&group_members.clone())?;
    let group_members_entry_hash = hash_entry(&group_members.clone())?;

    // link Group -> GroupMembers tag "members
    create_link(
        group_hash,
        group_members_entry_hash.clone(),
        LinkTag::new("members"),
    )?;

    // link from the GroupMembers to own pubkey with tag "keyholder"
    create_link(
        group_members_entry_hash.clone(),
        agent_info()?.agent_latest_pubkey.into(),
        LinkTag::new("keyholder"),

    )?;     

    // [for all newly added agent]
    // link from each member to GroupMembers entry tag "member"
    for agent in members.clone(){

        create_link(
            agent.into(),
            group_members_entry_hash.clone(),
            LinkTag::new("member")
        )?;
    }

    //[for all added agents]
    //send remote signal with SignalGroupMembersData as payload    
    let signal_group_members_data = SignalGroupMembersData::new(group_members_entry_hash)?;    

    debug!("string de debug");

    remote_signal(
        &signal_group_members_data.clone(),
        members,
    )?;

    Ok(group_members_header_hash)
}

pub fn _request_secrets(group_members_hashes: HashesWrapper)-> ExternResult<()>{

    //GroupMembers entry hashes
    let group_members_hashes: Vec<EntryHash> = group_members_hashes.0;
    //let _secrets_output:Vec<Secrets> = vec![];    
    
    // [for all entry hashes] -> get 
    for group_members_hash in group_members_hashes {

        if let Some(element) =  get(group_members_hash, GetOptions::content())? {

            let element_entry_option:Option<GroupMembers> = element.entry().to_app_option()?;

            if let Some(group_members_entry) = element_entry_option  {

                //GroupMembers entry
                //check if the agent is part of the group's members for the secret he's asking for

                if group_members_entry.members.contains(&agent_info()?.agent_latest_pubkey) {
                    //check if you have the secret in source chain

                    //1- we have to get the hash from this group_secret;
                    let key_hash:XSalsa20Poly1305KeyRef = group_members_entry.secret_hash.0;
                    let group_hash:EntryHash = group_members_entry.group_hash;  
                
                    let group_secret_key_hash:EntryHash = hash_entry(&GroupSecretKey {
                        group_hash:group_hash,
                        key_hash:key_hash.clone(),
                    })?; 

                    //2- we have to check if we have this entry commited on our source chain
                    if let Some(_) = get(group_secret_key_hash, GetOptions::content())? {
                        // when i do get, this check if i have this element into my source chain or should i use query for this ?
                    
                        //encrypt secret in Lair with Bobby's pubkey?  how can i do this, lair are fully implemented yet ? or its in development i just see a macro definition from this feature
                        
                        // i have to use salsa  From<[u8; 32]> for X25519PubKey // tryFrom <>

                        let agent_pub_key = agent_info()?.agent_latest_pubkey;
                    
                        if let Ok(_agent_key) = X25519PubKey::try_from(agent_pub_key.get_raw_32()){

                            //bob_key should be the encription key


                        }

                        
                        // collect all encrypted secrets:

                    

                    }else {
                        return Err(HdkError::Wasm(WasmError::Zome(String::from("cant find this secret :C"))));
                    }

                }else{
                    //[Bobby is not part of some group]-> return Error
                    return Err(HdkError::Wasm(WasmError::Zome(String::from("you're not member of this group"))));
                }

            }
        }
    }
    Ok(())
}
pub fn get_needed_group_members_hashes(_:())->ExternResult<()>{

    let my_pub_key_hash:EntryHash = hash_entry(&agent_info()?.agent_latest_pubkey)?; 
    //get_links from pubkey with tag "member"
    let my_linked_groups:Vec<Link>= get_links(my_pub_key_hash, Some(LinkTag::new("member")))?.into_inner();
    
    //[for all groups_members_entries_linked]

    let mut latest_group_members_entries:Vec<GroupMembers> = vec![];
    
    for link in my_linked_groups{
        //[until we get the latest entry]
        //recrusively get_detail from the linked GroupMembers entry
    
        //1- we have to get the header hash from the original group_members_entry
        
        let link_target:EntryHash = link.target; // this target its the group_members_entry_hash

        let group_members_header_hash:HeaderHash = get_header_address_from_entry_hash(link_target)?;

        let latest_element_entry:ElementEntry = recursively_get_details(group_members_header_hash)?;
 
        if let Some(group_members) = latest_element_entry.to_app_option()?{
            
            latest_group_members_entries.push(group_members);
        }
    }

   // return latest Group Members entry of all groups (stored into an homonym named array )

   // query source chain for all secrets bob has
    let my_stored_secrets:Vec<GroupSecretKey> = get_all_my_stored_secrets(())?;

    //filter GroupMembers entry that Bob is part of but dont have the secret yet and get their entry hashes
    let mut groups_to_request:Vec<GroupMembers> = vec![];

    let mut needed:bool ;

    // doble for can be removed in future , for optimization purposes
    // TATS: what do you mean by this?

    for group_members in latest_group_members_entries{

        needed = true;

        for secret in my_stored_secrets.clone() {
            if group_members.group_hash.eq(&secret.group_hash){
        
                needed = false;    
                break;
            }
        }
        if needed {
            groups_to_request.push(group_members);
        }
    }

    // call handshake()

    Ok(())
}

// TATS: this function is about getting the groups an agent is part of 
// and not getting all the groups that exists in DHT. (sorry for the ambiguity)
// please check the flow in architecture for specific flow.
// Also the way to get the latest Group entry changed too 
// so please check that as well. It's the part where there is 
// [if ther is an update for Group Entry]
pub fn get_all_groups(_:())->HdkResult<GroupListOutput>{

    let path = Path::from(format!("all_groups"));
    path.ensure()?;
    let links_target_entries_hashes:Vec<EntryHash> = get_links(path.hash()?, Some(LinkTag::new("group")))?.into_inner().iter().map(|link|->EntryHash { return link.target.clone();} ).collect();

    let mut groups_entries:Vec<Group> = vec![];

    for hash in links_target_entries_hashes{

        if let Some(element) = get(hash,GetOptions::latest())? {

            if let Some(group) = element.entry().to_app_option()?{
                groups_entries.push(group);
            }
        }
    }
    Ok(GroupListOutput(groups_entries))
}
// HELPER FUNCTION
fn get_all_groups_path()->HdkResult<EntryHash>{
    let all_groups_path:Path = Path::from(format!("all_groups"));
    all_groups_path.ensure()?;
    all_groups_path.hash()
}
fn get_all_my_stored_secrets(_:())->HdkResult<Vec<GroupSecretKey>>{

    //all the group_secret_key are stored into the source chain, we have to perform a query
    const GROUP_SECRET_KEY_DEF_ID:u8 = 2;
    
    let entry_def_index:EntryDefIndex = EntryDefIndex::from(GROUP_SECRET_KEY_DEF_ID);
    let zome_id:ZomeId = zome_info()?.zome_id;
    let mut my_groups_secrets:Vec<GroupSecretKey>  = vec![]; 
    

    let filter:QueryFilter = QueryFilter::new().entry_type(
        EntryType::App(AppEntryType::new(
            entry_def_index,
            zome_id,
            EntryVisibility::Private,
        ))).include_entries(true); 


    let query_result:Vec<Element> = query(filter)?.0;

    for element in query_result {
        if let Some(group_secret) = element.entry().to_app_option()?{
            my_groups_secrets.push(group_secret);

        }
    } 

    Ok(my_groups_secrets)
} 
//this should be moved to utils.rs 
pub fn get_header_address_from_entry_hash(hash:EntryHash)->HdkResult<HeaderHash>{

    if let Some(element) = get(hash, GetOptions::content())?{
        return Ok(element.header_address().to_owned());
    }

 Err(HdkError::Wasm(WasmError::Zome(String::from("header not found for this entry_hash"))))
}
pub fn recursively_get_details(hash:HeaderHash)-> HdkResult<ElementEntry>{

    //the latest entry, its the entry who their details have an update vec empty () , we should return errors if the details contains deletes  
    if let Some(details) = get_details(hash,GetOptions::content())? {

        match details{
            Details::Element(element_details) => {

                if element_details.updates.is_empty() {

                    return Ok(element_details.element.entry().to_owned());
                }else{
                  //if this entry have an update // we should call recursively get details
                    if let Some(element_update) = element_details.updates.last() {

                        return recursively_get_details( element_update.header_address().to_owned() );
                    }
                }
            },
            Details::Entry(_entry_details) => (),    
        }
    }
    return Err(HdkError::Wasm(WasmError::Zome(String::from("we cant find these header details"))));
}



