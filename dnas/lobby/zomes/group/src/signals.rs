use crate::entries::group_message::{
    GroupMessageData, GroupMessageReadData, GroupTypingDetailData,
};
use hdk3::prelude::*;
//use timestamp::Timestamp
//use crate::utils::to_timestamp;

// Signal Details is a warpper for all the signals we can send from the happ
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub struct SignalDetails {
    pub name: String,
    pub payload: SignalPayload,
}

// Here we add all the signal_types we add in the future
#[derive(Serialize, Deserialize, SerializedBytes, Clone)]
pub enum SignalPayload {
    // TODO: we may want to change the payload to the actual Group in the future.
    AddedToGroup(EntryHash),
    GroupTypingDetail(GroupTypingDetailData),
    GroupMessageRead(GroupMessageReadData),
    GroupMessageData(GroupMessageData),
}

pub struct SignalName;
impl SignalName {
    pub const ADDED_TO_GROUP: &'static str = "added_to_group";
    pub const GROUP_TYPING_DETAIL: &'static str = &"group_typing_detail";
    pub const GROUP_MESSAGE_READ: &'static str = &"group_message_read";
    pub const GROUP_MESSAGE_DATA: &'static str = &"group_messsage_data";
}
