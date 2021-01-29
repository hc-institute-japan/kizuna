use std::time::Duration;
use hdk3::prelude::*;

use timestamp::Timestamp;



use crate::entries::group::{
    //Group,
    BlockedWrapper,
};

pub(crate) fn to_timestamp(duration: Duration) -> Timestamp {
    Timestamp(duration.as_secs() as i64, duration.subsec_nanos())
}
pub(crate)fn get_my_blocked_list()->HdkResult<BlockedWrapper>{
    //call list_blocked() to contacts zome
    let zome_name:ZomeName = ZomeName("contacts".to_owned());
    let function_name:FunctionName = FunctionName("list_blocked".to_owned());

    let my_blocked_list:BlockedWrapper = call(

        None,//The cell you want to call (If None will call the current cell).
        zome_name,
        function_name,
        None, //The capability secret if required.
        &()   //This are the input value we send to the fuction we are calling
    )?;

    Ok(my_blocked_list)
}
/*

// GET DETAILS HELPER FUNCTIONS 
#[derive(Deserialize, Serialize, SerializedBytes)]
pub struct HashesOutput{
    pub header_hash:HeaderHash,
    pub entry_hash:EntryHash,
}
pub(crate)fn get_group_entry_and_header_hash(input:Group)->ExternResult<HashesOutput>{

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

pub(crate)fn get_group_latest_vertion(group_id:EntryHash)->HdkResult<Group>{

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
}*/





