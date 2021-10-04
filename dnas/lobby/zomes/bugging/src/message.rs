use derive_more::{From, Into};
use hdk::prelude::{timestamp::Timestamp, *};
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PMessage {
    pub author: AgentPubKey,
    pub receiver: AgentPubKey,
    pub payload: Text,
    pub time_sent: Timestamp,
    pub reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct Text {
    payload: String,
}

entry_def!(P2PMessage
  EntryDef {
      id: "p2pmessage".into(),
      visibility: EntryVisibility::Private,
      crdt_type: CrdtType,
      required_validations: RequiredValidations::default(),
      required_validation_type: RequiredValidationType::Element
  }
);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PMessageReceipt {
    pub id: Vec<EntryHash>,
    pub status: Status,
}

entry_def!(P2PMessageReceipt EntryDef {
  id: "p2pmessagereceipt".into(),
  visibility: EntryVisibility::Private,
  crdt_type: CrdtType,
  required_validations: RequiredValidations::default(),
  required_validation_type: RequiredValidationType::Element
});

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum Status {
    Sent { timestamp: Timestamp },
    Delivered { timestamp: Timestamp },
    Read { timestamp: Timestamp },
}

#[derive(From, Into, Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct MessageDataAndReceipt(pub P2PMessageDataWithHash, pub P2PMessageReceiptWithHash);

#[derive(From, Into, Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct P2PMessageDataWithHash(pub EntryHash, pub P2PMessageData);

#[derive(From, Into, Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct P2PMessageReceiptWithHash(pub EntryHash, pub P2PMessageReceipt);

#[derive(From, Into, Serialize, Deserialize, Clone, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct P2PMessageData {
    pub author: AgentPubKey,
    pub receiver: AgentPubKey,
    pub payload: Text,
    pub time_sent: Timestamp,
    pub reply_to: Option<P2PMessageReplyTo>,
}

#[derive(From, Into, Serialize, Deserialize, Clone, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct P2PMessageReplyTo {
    hash: EntryHash,
    author: AgentPubKey,
    receiver: AgentPubKey,
    payload: Text,
    time_sent: Timestamp,
    reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageInput {
    pub receiver: AgentPubKey,
    pub payload: Text,
    pub reply_to: Option<EntryHash>,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct ReceiveMessageInput(pub P2PMessage, pub Option<P2PFileBytes>);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PFileBytes(SerializedBytes);

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(tag = "type")]
pub enum Signal {
    Message(MessageSignal),
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct MessageSignal {
    pub message: MessageDataAndReceipt,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct SignalDetails {
    pub name: String,
    pub payload: Signal,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct P2PMessages(pub Vec<P2PMessage>);
