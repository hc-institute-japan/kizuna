use hdk3::prelude::*;
use timestamp::Timestamp;

use crate::utils::to_timestamp;

#[derive(Serialize, Deserialize, SerializedBytes)]

//Signal Details is a warpper for all the signals we can send from the happ
pub(crate) struct SignalDetails{

    name: String,
    payload: SignalPayload
}


//here we add all the signal_types we add in the future
#[derive(Serialize, Deserialize, SerializedBytes)]
pub(crate)enum  SignalPayload{

    SignalGroupMembersData(SignalGroupMembersData),

}

#[derive(Serialize, Deserialize, SerializedBytes)]
pub(crate) struct SignalGroupMembersData{

    group_members_hash: EntryHash ,
    created_by: AgentPubKey,
    created_at: Timestamp,

}

impl SignalGroupMembersData{

    pub fn new(group_members_hash:EntryHash)->HdkResult<SignalDetails>{

        let  created_by: AgentPubKey = agent_info()?.agent_latest_pubkey;
        let created_at: Timestamp =  to_timestamp(sys_time()?);
        
        let name:String = String::from("group_members_signal");        
        let payload:SignalPayload = SignalPayload::SignalGroupMembersData(Self{
            
            group_members_hash,
            created_by,
            created_at

        });
        
        Ok(SignalDetails{
            name,
            payload
        })
    }
}