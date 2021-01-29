use hdk3::prelude::*;
//use timestamp::Timestamp
//use crate::utils::to_timestamp;

// Signal Details is a warpper for all the signals we can send from the happ
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub(crate) struct SignalDetails{
    pub name: String,
    pub payload: SignalPayload
}
// Here we add all the signal_types we add in the future
#[derive(Serialize, Deserialize, SerializedBytes,Clone)]
pub(crate)enum  SignalPayload{

    AddedToGroup(EntryHash),


}