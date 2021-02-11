use hdk3::prelude::*;
//use timestamp::Timestamp
//use crate::utils::to_timestamp;

// Signal Details is a warpper for all the signals we can send from the happ
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct SignalDetails{
    pub name: String,
    pub payload: SignalPayload
}
// Here we add all the signal_types we add in the future
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub enum  SignalPayload{
    // TODO: we may want to change the payload to the actual Group in the future.
    AddedToGroup(EntryHash),
}