use hdk3::prelude::*;

use hdk3::prelude::{
    Links,
   
};

use crate::entries::group::{
    Group,
    GroupMembers,
};

pub(crate) fn _get_group_members(group:Group)->HdkResult<GroupMembers>{
    let group_entry_hash:EntryHash = hash_entry(&group)?;
    let links: Links = get_links(group_entry_hash, Some(LinkTag::new("members")))?;

    for link in links.clone().into_inner(){

        if let Some(group_members_element) = get(link.target, GetOptions::content())? {

            let group_members_option:Option<GroupMembers>= group_members_element.entry().to_app_option()?;
            
            if let Some(group_members) = group_members_option {

                return  Ok(group_members);
            }
        }else{
            break;
        } 
    }

    Err(HdkError::Wasm(WasmError::Zome(String::from("groups_members not found fn create_group has an error"))))
}


