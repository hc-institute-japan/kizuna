use hdk::prelude::*;

pub mod create_group_meta;
pub mod get_group_metadata;

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GroupDnaMeta {
    creator: AgentPubKey,
    created: Timestamp,
    passphrase: String,
    image: Option<EntryHash>,
    members: Vec<AgentPubKey>,
}

entry_def!(GroupDnaMeta
  EntryDef{
      id: "group_dna_meta".into(),
      visibility: EntryVisibility::Public,
      crdt_type: CrdtType,
      required_validations: RequiredValidations::default(),
      required_validation_type: RequiredValidationType::Element
  }
);

impl GroupDnaMeta {
    pub fn new(
        creator: AgentPubKey,
        created: Timestamp,
        passphrase: String,
        image: Option<EntryHash>,
        members: Vec<AgentPubKey>,
    ) -> Self {
        GroupDnaMeta {
            creator,
            created,
            passphrase,
            image,
            members,
        }
    }
}
