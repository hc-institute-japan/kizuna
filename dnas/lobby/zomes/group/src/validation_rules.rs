use hdk::prelude::*;
pub mod run_validations;
pub mod validate_create_group;
pub mod validate_update_group;

#[derive(Deserialize, Serialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ValidationInput {
    pub validation_type: String,
    pub group_revision_id: HeaderHash,
}
