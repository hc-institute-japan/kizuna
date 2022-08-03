// use hdk::prelude::timestamp::Timestamp;
// use hdk::prelude::*;

// pub mod add_members;
// pub mod create_group;
// pub mod get_all_my_groups;
// pub mod group_helpers;
// pub mod remove_members;
// pub mod update_group_avatar;
// pub mod update_group_name;
// pub mod validations;


/* IO TYPE DEFINITION */
// #[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct UpdateMembersIO {
//     pub members: Vec<AgentPubKey>,
//     pub group_id: EntryHash,
//     pub group_revision_id: ActionHash,
// }

// #[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct UpdateGroupNameIO {
//     name: String,
//     group_id: EntryHash,
//     group_revision_id: ActionHash,
// }

// #[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct UpdateGroupAvatarIO {
//     avatar: String,
//     group_id: EntryHash,
//     group_revision_id: ActionHash,
// }
/* END OF IO TYPES DEFINITION */

/* INPUT TYPES DEFINITION */
// #[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct CreateGroupInput {
//     name: String,
//     members: Vec<AgentPubKey>,
// }
/* END OF INPUT TYPES DEFINITION */

/* OUTPUT TYPES DEFINITION */
// #[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct CreateGroupOutput {
//     pub content: Group,
//     pub group_revision_id: ActionHash,
//     pub group_id: EntryHash,
// }
// #[derive(Deserialize, Serialize, SerializedBytes, Clone, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct GroupOutput {
//     pub group_id: EntryHash,
//     pub group_revision_id: ActionHash,
//     pub latest_name: String,
//     pub members: Vec<AgentPubKey>,
//     pub creator: AgentPubKey,
//     pub created: Timestamp,
//     pub avatar: Option<String>, 
//     // group_versions: Vec<Group>,
// }

// impl GroupOutput {
//     fn new(group: Group, group_id: EntryHash, group_revision_id: ActionHash) -> GroupOutput {
//         GroupOutput {
//             group_id: group_id,
//             group_revision_id: group_revision_id,
//             latest_name: group.name,
//             members: group.members,
//             creator: group.creator,
//             created: group.created,
//             avatar: group.avatar,
//         }
//     }
// }
/* END OF OUTPUT TYPES DEFINITION */
