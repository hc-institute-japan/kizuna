import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { Uint8ArrayToBase64, base64ToUint8Array } from "../../utils/helpers";
import { Profile } from "../profile/types";
import {
  AddGroupAction,
  AddGroupMembersAction,
  RemoveGroupMembersAction,
  UpdateGroupNameAction,
  sendGroupMessageAction,
  ADD_GROUP,
  ADD_MEMBERS,
  REMOVE_MEMBERS,
  UPDATE_GROUP_NAME,
  SEND_GROUP_MESSAGE,
  CreateGroupInput,
  GroupConversation,
  UpdateGroupMembersIO,
  UpdateGroupNameIO,
  UpdateGroupMembersData,
  UpdateGroupNameData,
  GroupMessageInput,
  GroupMessage,
  Payload,
  FilePayload,
  FileType,
  isTextPayload,
  isOther,
  isImage,
} from "./types";
import { SET_CONVERSATIONS } from "../groupConversations/types";

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
    originalGroupEntryHash: Uint8ArrayToBase64(createGroupRes.groupId),
    originalGroupHeaderHash: Uint8ArrayToBase64(createGroupRes.groupRevisionId),
    name: createGroupRes.content.name,
    members: createGroupRes.content.members.map((member: Buffer) =>
      Uint8ArrayToBase64(member)
    ),
    createdAt: createGroupRes.content.created,
    creator: Uint8ArrayToBase64(createGroupRes.content.creator),
    messages: [],
  };

  dispatch<AddGroupAction>({
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
  if (group_data.creator === Uint8ArrayToBase64(myAgentId!)) {
    return null;
  }
  dispatch<AddGroupAction>({
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
  update_group_members_data: UpdateGroupMembersData
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  let updateGroupMembersIO: UpdateGroupMembersIO = {
    members: update_group_members_data.members.map((member: string) =>
      Buffer.from(base64ToUint8Array(member).buffer)
    ),
    groupId: base64ToUint8Array(update_group_members_data.groupId),
    groupRevisionId: base64ToUint8Array(
      update_group_members_data.groupRevisionId
    ),
  };

  // TODO: error handling
  // TODO: input sanitation
  // Might be better to check whether there are any members duplicate in ui or hc.
  const addMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
    payload: updateGroupMembersIO,
  });

  let updateGroupMembersData: UpdateGroupMembersData = {
    members: addMembersOutput.members.map((member) =>
      Uint8ArrayToBase64(member)
    ),
    groupId: Uint8ArrayToBase64(addMembersOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(addMembersOutput.groupRevisionId),
  };

  dispatch<AddGroupMembersAction>({
    type: ADD_MEMBERS,
    updateGroupMembersData,
  });

  return updateGroupMembersData;
};

export const removeGroupMembers = (
  update_group_members_data: UpdateGroupMembersData
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  let updateGroupMembersIO: UpdateGroupMembersIO = {
    members: update_group_members_data.members.map((member: string) =>
      Buffer.from(base64ToUint8Array(member).buffer)
    ),
    groupId: base64ToUint8Array(update_group_members_data.groupId),
    groupRevisionId: base64ToUint8Array(
      update_group_members_data.groupRevisionId
    ),
  };
  // TODO: error handling
  // TODO: input sanitation
  // make sure the members being removed are actual members of the group.
  const removeMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].REMOVE_MEMBERS,
    payload: updateGroupMembersIO,
  });

  let updateGroupMembersData: UpdateGroupMembersData = {
    members: removeMembersOutput.members.map((member) =>
      Uint8ArrayToBase64(member)
    ),
    groupId: Uint8ArrayToBase64(removeMembersOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(removeMembersOutput.groupRevisionId),
  };

  dispatch<RemoveGroupMembersAction>({
    type: REMOVE_MEMBERS,
    updateGroupMembersData,
  });

  return updateGroupMembersData;
};

export const updateGroupName = (
  update_group_name_data: UpdateGroupNameData
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  let updateGroupNameIO: UpdateGroupNameIO = {
    name: update_group_name_data.name,
    groupId: base64ToUint8Array(update_group_name_data.groupId),
    groupRevisionId: base64ToUint8Array(update_group_name_data.groupRevisionId),
  };
  // TODO: error handling
  // TODO: input sanitation
  const updateGroupNameOutput: UpdateGroupNameIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
    payload: updateGroupNameIO,
  });

  let updateGroupNameData: UpdateGroupNameData = {
    name: updateGroupNameOutput.name,
    groupId: Uint8ArrayToBase64(updateGroupNameOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(updateGroupNameOutput.groupRevisionId),
  };

  dispatch<UpdateGroupNameAction>({
    type: UPDATE_GROUP_NAME,
    updateGroupNameData,
  });

  return updateGroupNameData;
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
    let fileType: FileType =
      sendGroupMessageOutput.content.payload.payload.fileType;
    let thumbnail: Uint8Array | undefined = isOther(fileType)
      ? undefined
      : isImage(fileType)
      ? fileType.payload.thumbnail
      : fileType.payload.thumbnail;
    fileBytes = group_message_data.payloadInput.payload.fileBytes;
    let filePayload: FilePayload = {
      fileName:
        sendGroupMessageOutput.content.payload.payload.metadata.fileName,
      fileSize:
        sendGroupMessageOutput.content.payload.payload.metadata.fileSize,
      fileType:
        sendGroupMessageOutput.content.payload.payload.metadata.fileType,
      fileHash: Uint8ArrayToBase64(
        sendGroupMessageOutput.content.payload.payload.metadata.fileHash
      ),
      thumbnail,
    };
    payload = filePayload;
  }

  let groupMessageData: GroupMessage = {
    groupMessageEntryHash: Uint8ArrayToBase64(sendGroupMessageOutput.id),
    groupEntryHash: Uint8ArrayToBase64(
      sendGroupMessageOutput.content.groupHash
    ),
    author: Uint8ArrayToBase64(sendGroupMessageOutput.content.sender),
    payload,
    timestamp: sendGroupMessageOutput.content.created,
    replyTo: !sendGroupMessageOutput.content.replyTo
      ? undefined
      : Uint8ArrayToBase64(sendGroupMessageOutput.content.replyTo),
    readList: {},
  };

  dispatch<sendGroupMessageAction>({
    type: SEND_GROUP_MESSAGE,
    groupMessage: groupMessageData,
    fileBytes,
  });

  return groupMessageData;
};

export const sendInitialGroupMessage = (
  members: Profile[],
  message: string
): ThunkAction => async (dispatch, getState, { callZome }) => {
  const { conversations, messages } = getState().groups;
  const name = members.map((member) => member.username).join(", ");
  const groupResult = await dispatch(
    createGroup({
      name,
      members: members.map((member) =>
        Buffer.from(base64ToUint8Array(member.id).buffer)
      ),
    })
  );

  const date = new Date(groupResult.content.created[0] * 1000);

  const messageResult = await dispatch(
    sendGroupMessage({
      groupHash: groupResult.groupId,
      payloadInput: {
        type: "TEXT",
        payload: { payload: message },
      },
      sender: groupResult.content.creator,
    })
  );

  // const groupRes = await callZome({
  //   zomeName: ZOMES.GROUP,
  //   fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
  //   payload: {
  //     name,
  //     members: members.map((member) => member.id),
  //   },
  // });
  // if (groupRes?.type !== "error") {
  //   const date = new Date(groupRes.content.created[0] * 1000);

  //   const messageRes = await callZome({
  //     zomeName: ZOMES.GROUP,
  //     fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
  //     payload: {
  //       sender: groupRes.content.creator,
  //       groupHash: groupRes.groupId,
  //       payloadInput: {
  //         type: "TEXT",
  //         payload: {
  //           payload: message,
  //         },
  //       },
  //     },
  //   });
  //   if (messageRes?.type !== "error") {
  //     const groupConversation: GroupConversation = {
  //       originalGroupEntryHash: groupRes.groupId,
  //       originalGroupHeaderHash: groupRes.groupRevisionId,
  //       createdAt: date,
  //       creator: groupRes.content.creator,
  //       messages: [Uint8ArrayToBase64(messageRes.id)],
  //     };
  //     const groupMessage: GroupMessage = {
  //       groupMessageEntryHash: messageRes.id,
  //       groupEntryHash: groupRes.groupId,
  //       author: groupRes.content.creator,
  //       payload: {

  //         payload: message,
  //       },
  //       timestamp: new Date(messageRes.content.created[0] * 1000),
  //       readList: {},
  //     };
  //     dispatch({
  //       type: SET_CONVERSATIONS,
  //       conversations: {
  //         ...conversations,
  //         [Uint8ArrayToBase64(groupRes.groupId)]: groupConversation,
  //       },
  //     });
  //     dispatch({
  //       type: SET_MESSAGES,
  //       messages: {
  //         ...messages,
  //         [Uint8ArrayToBase64(messageRes.id)]: groupMessage,
  //       },
  //     });
  //     return groupConversation;
  // }
  // }
  return false;
};

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
