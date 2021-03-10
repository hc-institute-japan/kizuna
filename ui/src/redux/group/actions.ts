import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { Uint8ArrayToBase64 } from "../../utils/helpers";
import { Profile } from "../profile/types";
import {
  ADD_GROUP,
  ADD_MEMBERS,
  REMOVE_MEMBERS,
  UPDATE_GROUP_NAME,
  SEND_GROUP_MESSAGE,
  CreateGroupInput,
  GroupConversation,
  UpdateGroupMembersIO,
  UpdateGroupNameIO,
  GroupMessageInput,
  GroupMessage,
  Payload,
  FilePayload,
  FileType,
  isTextPayload,
  isOther,
  isImage,
} from "./types";

export const createGroup = (
  create_group_input: CreateGroupInput
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // TODO: error handling
  // TODO: input sanitation
  const createGroupRes = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
    payload: create_group_input,
  });

  console.log(createGroupRes);

  let groupData: GroupConversation = {
    originalGroupEntryHash: createGroupRes.groupId,
    originalGroupHeaderHash: createGroupRes.groupRevisionId,
    name: createGroupRes.content.name,
    members: createGroupRes.content.members,
    createdAt: createGroupRes.content.created,
    creator: createGroupRes.content.creator,
    messages: [],
  };

  dispatch({
    type: ADD_GROUP,
    groupData,
  });

  return groupData;
};

export const addedToGroup = (
  group_data: GroupConversation
): ThunkAction => async (dispatch, _getState, { getAgentId }) => {
  // TODO: error handling?
  const myAgentId = await getAgentId();
  // do nothing if self created group
  if (group_data.creator === myAgentId) {
    return null;
  }
  dispatch({
    type: ADD_GROUP,
    groupData: {
      originalGroupEntryHash: group_data.originalGroupEntryHash,
      originalGroupHeaderHash: group_data.originalGroupHeaderHash,
      name: group_data.name,
      createdAt: group_data.createdAt,
      creator: group_data.creator,
      members: group_data.members,
      messages: [],
    },
  });
};

export const addGroupMembers = (
  update_group_members_io: UpdateGroupMembersIO
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // TODO: error handling
  // TODO: input sanitation
  // Might be better to check whether there are any members duplicate in ui or hc.
  const addMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
    payload: update_group_members_io,
  });

  dispatch({
    type: ADD_MEMBERS,
    updateGroupMembersData: addMembersOutput,
  });

  return update_group_members_io;
};

export const removeGroupMembers = (
  update_group_members_io: UpdateGroupMembersIO
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // TODO: error handling
  // TODO: input sanitation
  // make sure the members being removed are actual members of the group.
  const removeMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].REMOVE_MEMBERS,
    payload: update_group_members_io,
  });

  dispatch({
    type: REMOVE_MEMBERS,
    updateGroupMembersData: removeMembersOutput,
  });

  return update_group_members_io;
};

export const updateGroupName = (
  update_group_name_io: UpdateGroupNameIO
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // TODO: error handling
  // TODO: input sanitation
  const updateGroupNameOutput: UpdateGroupNameIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
    payload: update_group_name_io,
  });

  dispatch({
    type: UPDATE_GROUP_NAME,
    UpdateGroupNameIO: updateGroupNameOutput,
  });

  return update_group_name_io;
};

export const sendGroupMessage = (
  group_message_data: GroupMessageInput
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // TODO: error handling
  // TODO: input sanitation
  const sendGroupMessageOutput = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
    payload: group_message_data,
  });

  console.log(sendGroupMessageOutput);

  let payload: Payload;
  let fileBytes: Uint8Array | undefined;
  if (isTextPayload(group_message_data.payloadInput)) {
    payload = sendGroupMessageOutput.content.payload;
  } else {
    console.log(sendGroupMessageOutput);
    let fileType: FileType =
      sendGroupMessageOutput.content.payload.File.file_type;
    let thumbnail: Uint8Array | undefined = isOther(fileType)
      ? undefined
      : isImage(fileType)
      ? fileType.Image.thumbnail
      : fileType.Video.thumbnail;
    fileBytes = group_message_data.payloadInput.File.file_bytes;
    let filePayload: FilePayload = {
      fileName: sendGroupMessageOutput.content.payload.File.metadata.fileName,
      fileSize: sendGroupMessageOutput.content.payload.File.metadata.fileSize,
      fileType: sendGroupMessageOutput.content.payload.File.metadata.fileType,
      fileHash: sendGroupMessageOutput.content.payload.File.metadata.fileHash,
      thumbnail,
    };
    payload = filePayload;
  }

  let groupMessageData: GroupMessage = {
    groupMessageEntryHash: sendGroupMessageOutput.id,
    groupEntryHash: sendGroupMessageOutput.content.groupHash,
    author: sendGroupMessageOutput.content.sender,
    payload,
    timestamp: sendGroupMessageOutput.content.created,
    replyTo: sendGroupMessageOutput.content.replyTo,
    readList: {},
  };

  dispatch({
    type: SEND_GROUP_MESSAGE,
    GroupMessage: groupMessageData,
    fileBytes,
  });

  return groupMessageData;
};

// export const sendInitialGroupMessage = (
//   members: Profile[],
//   message: string
// ): ThunkAction => async (dispatch, getState, { callZome }) => {
//   const { conversations, messages } = getState().groupConversations;
//   const name = members.map((member) => member.username).join(", ");
//   const groupRes = await callZome({
//     zomeName: ZOMES.GROUP,
//     fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
//     payload: {
//       name,
//       members: members.map((member) => member.id),
//     },
//   });
//   if (groupRes?.type !== "error") {
//     const date = new Date(groupRes.content.created[0] * 1000);

//     const messageRes = await callZome({
//       zomeName: ZOMES.GROUP,
//       fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
//       payload: {
//         sender: groupRes.content.creator,
//         groupHash: groupRes.groupId,
//         payloadInput: {
//           type: "TEXT",
//           payload: {
//             payload: message,
//           },
//         },
//       },
//     });
//     if (messageRes?.type !== "error") {
//       const groupConversation: GroupConversation = {
//         originalGroupEntryHash: groupRes.groupId,
//         originalGroupHeaderHash: groupRes.groupRevisionId,
//         createdAt: date,
//         creator: groupRes.content.creator,
//         messages: [Uint8ArrayToBase64(messageRes.id)],
//         versions: [
//           {
//             groupEntryHash: groupRes.groupId,
//             name,
//             conversants: members.map((contact) =>
//               Uint8ArrayToBase64(contact.id)
//             ),
//             timestamp: date,
//           },
//         ],
//       };
//       const groupMessage: GroupMessage = {
//         groupMessageEntryHash: messageRes.id,
//         groupEntryHash: groupRes.groupId,
//         author: groupRes.content.creator,
//         payload: {
//           payload: message,
//         },
//         timestamp: new Date(messageRes.content.created[0] * 1000),
//         readList: {},
//       };
//       dispatch({
//         type: SET_CONVERSATIONS,
//         conversations: {
//           ...conversations,
//           [Uint8ArrayToBase64(groupRes.groupId)]: groupConversation,
//         },
//       });
//       dispatch({
//         type: SET_MESSAGES,
//         messages: {
//           ...messages,
//           [Uint8ArrayToBase64(messageRes.id)]: groupMessage,
//         },
//       });
//       return groupConversation;
//     }
//   }
//   return false;
// };

export const getNextBatchGroupMessages = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {};

export const getMessagesByGroupByTimestamp = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {};

// these might not be needed because aggregator exists
export const getLatestMessagesForAllGroups = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {};

export const getAllMyGroups = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {};
