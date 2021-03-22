import { FUNCTIONS, ZOMES } from "../../connection/types";
import { CallZomeConfig, ThunkAction } from "../types";
import {
  Uint8ArrayToBase64,
  base64ToUint8Array,
  objectMap,
} from "../../utils/helpers";
import { Profile } from "../profile/types";
import {
  // action types
  ADD_GROUP,
  ADD_MEMBERS,
  REMOVE_MEMBERS,
  UPDATE_GROUP_NAME,
  SEND_GROUP_MESSAGE,
  GET_NEXT_BATCH_GROUP_MESSAGES,
  // IO
  CreateGroupInput,
  GroupConversation,
  UpdateGroupMembersIO,
  UpdateGroupMembersData,
  UpdateGroupNameIO,
  UpdateGroupNameData,
  GroupMessageInput,
  GroupMessage,
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  MessagesByGroup,
  GroupMessagesContents,
  GroupMessageByDateFetchFilter,
  // action payload types
  AddGroupAction,
  AddGroupMembersAction,
  RemoveGroupMembersAction,
  UpdateGroupNameAction,
  SendGroupMessageAction,
  GetNextBatchGroupMessagesAction,
} from "./types";
import {
  Payload,
  FilePayload,
  TextPayload,
  FileType,
  // type guards
  isTextPayload,
  isOther,
  isImage,
} from "../commons/types";
import { AgentPubKey } from "@holochain/conductor-api";
import { ContactsState } from "../contacts/types";

export const createGroup = (
  createGroupInput: CreateGroupInput
): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
): Promise<GroupConversation> => {
  // TODO: error handling
  // TODO: input sanitation
  const createGroupRes = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
    payload: createGroupInput,
  });

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

  let contactsState = getState().contacts;
  let membersUsernames: {
    [key: string]: Profile;
  } = await fetchUsernameOfMembers(contactsState, groupData.members, callZome);

  dispatch<AddGroupAction>({
    type: ADD_GROUP,
    groupData,
    membersUsernames,
  });

  return groupData;
};

export const addedToGroup = (
  groupData: GroupConversation
): ThunkAction => async (dispatch, getState, { callZome, getAgentId }) => {
  // TODO: error handling?
  const myAgentId = await getAgentId();
  // do nothing if self created group
  if (groupData.creator === Uint8ArrayToBase64(myAgentId!)) {
    return null;
  }

  let contactsState = getState().contacts;
  let membersUsernames: {
    [key: string]: Profile;
  } = await fetchUsernameOfMembers(contactsState, groupData.members, callZome);

  dispatch<AddGroupAction>({
    type: ADD_GROUP,
    groupData: {
      originalGroupEntryHash: groupData.originalGroupEntryHash,
      originalGroupHeaderHash: groupData.originalGroupHeaderHash,
      name: groupData.name,
      createdAt: groupData.createdAt,
      creator: groupData.creator,
      members: groupData.members,
      messages: [],
    },
    membersUsernames,
  });
};

export const addGroupMembers = (
  updateGroupMembersData: UpdateGroupMembersData
): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
): Promise<UpdateGroupMembersData> => {
  let updateGroupMembersIO: UpdateGroupMembersIO = {
    members: updateGroupMembersData.members.map((member: string) =>
      Buffer.from(base64ToUint8Array(member).buffer)
    ),
    groupId: base64ToUint8Array(updateGroupMembersData.groupId),
    groupRevisionId: base64ToUint8Array(updateGroupMembersData.groupRevisionId),
  };

  // TODO: error handling
  // TODO: input sanitation
  // Might be better to check whether there are any members duplicate in ui or hc.
  const addMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
    payload: updateGroupMembersIO,
  });

  let membersBase64 = addMembersOutput.members.map((member) =>
    Uint8ArrayToBase64(member)
  );

  let updateGroupMembersDataFromRes: UpdateGroupMembersData = {
    members: membersBase64,
    groupId: Uint8ArrayToBase64(addMembersOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(addMembersOutput.groupRevisionId),
  };

  let contactsState = getState().contacts;
  let membersUsernames = await fetchUsernameOfMembers(
    contactsState,
    membersBase64,
    callZome
  );

  dispatch<AddGroupMembersAction>({
    type: ADD_MEMBERS,
    updateGroupMembersData: updateGroupMembersDataFromRes,
    membersUsernames,
  });

  return updateGroupMembersData;
};

export const removeGroupMembers = (
  updateGroupMembersData: UpdateGroupMembersData
): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
): Promise<UpdateGroupMembersData> => {
  let updateGroupMembersIO: UpdateGroupMembersIO = {
    members: updateGroupMembersData.members.map((member: string) =>
      Buffer.from(base64ToUint8Array(member).buffer)
    ),
    groupId: base64ToUint8Array(updateGroupMembersData.groupId),
    groupRevisionId: base64ToUint8Array(updateGroupMembersData.groupRevisionId),
  };
  // TODO: error handling
  // TODO: input sanitation
  // make sure the members being removed are actual members of the group.
  const removeMembersOutput: UpdateGroupMembersIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].REMOVE_MEMBERS,
    payload: updateGroupMembersIO,
  });

  let updateGroupMembersDataFromRes: UpdateGroupMembersData = {
    members: removeMembersOutput.members.map((member) =>
      Uint8ArrayToBase64(member)
    ),
    groupId: Uint8ArrayToBase64(removeMembersOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(removeMembersOutput.groupRevisionId),
  };

  dispatch<RemoveGroupMembersAction>({
    type: REMOVE_MEMBERS,
    updateGroupMembersData: updateGroupMembersDataFromRes,
  });

  return updateGroupMembersData;
};

export const updateGroupName = (
  updateGroupNameData: UpdateGroupNameData
): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
): Promise<UpdateGroupNameData> => {
  let updateGroupNameIO: UpdateGroupNameIO = {
    name: updateGroupNameData.name,
    groupId: base64ToUint8Array(updateGroupNameData.groupId),
    groupRevisionId: base64ToUint8Array(updateGroupNameData.groupRevisionId),
  };
  // TODO: error handling
  // TODO: input sanitation
  const updateGroupNameOutput: UpdateGroupNameIO = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
    payload: updateGroupNameIO,
  });

  let updateGroupNameDataFromRes: UpdateGroupNameData = {
    name: updateGroupNameOutput.name,
    groupId: Uint8ArrayToBase64(updateGroupNameOutput.groupId),
    groupRevisionId: Uint8ArrayToBase64(updateGroupNameOutput.groupRevisionId),
  };

  dispatch<UpdateGroupNameAction>({
    type: UPDATE_GROUP_NAME,
    updateGroupNameData: updateGroupNameDataFromRes,
  });

  return updateGroupNameData;
};

export const sendGroupMessage = (
  groupMessageData: GroupMessageInput
): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
): Promise<GroupMessage> => {
  // TODO: error handling
  // TODO: input sanitation
  const sendGroupMessageOutput = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
    payload: groupMessageData,
  });

  let payload: Payload;
  let fileBytes: Uint8Array | undefined;
  if (isTextPayload(groupMessageData.payloadInput)) {
    payload = sendGroupMessageOutput.content.payload;
  } else {
    let fileType: FileType =
      sendGroupMessageOutput.content.payload.payload.fileType;
    let thumbnail: Uint8Array | undefined = isOther(fileType)
      ? undefined
      : isImage(fileType)
      ? fileType.payload.thumbnail
      : fileType.payload.thumbnail;
    fileBytes = groupMessageData.payloadInput.payload.fileBytes;
    let filePayload: FilePayload = {
      type: "FILE",
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

  let groupMessageDataFromRes: GroupMessage = {
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

  dispatch<SendGroupMessageAction>({
    type: SEND_GROUP_MESSAGE,
    groupMessage: groupMessageDataFromRes,
    fileBytes,
  });

  return groupMessageDataFromRes;
};

export const sendInitialGroupMessage = (
  members: Profile[],
  // need to handle files as well
  message: string
): ThunkAction => async (dispatch) => {
  const name = members.map((member) => member.username).join(", ");
  const groupResult: GroupConversation = await dispatch(
    createGroup({
      name,
      members: members.map((member) =>
        Buffer.from(base64ToUint8Array(member.id).buffer)
      ),
    })
  );

  const messageResult = await dispatch(
    sendGroupMessage({
      groupHash: base64ToUint8Array(groupResult.originalGroupEntryHash),
      payloadInput: {
        type: "TEXT",
        payload: { payload: message },
      },
      sender: Buffer.from(base64ToUint8Array(groupResult.creator).buffer),
    })
  );
  return {
    groupResult,
    messageResult,
  };
};

export const getNextBatchGroupMessages = (
  groupMessageBatchFetchFilter: GroupMessageBatchFetchFilter
): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
): Promise<GroupMessagesOutput> => {
  // TODO: error handling
  // TODO: input sanitation
  const groupMessagesRes = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].GET_NEXT_BATCH_GROUP_MESSAGES,
    payload: groupMessageBatchFetchFilter,
  });

  let groupMessagesOutput: GroupMessagesOutput = convertFetchedResToGroupMessagesOutput(
    groupMessagesRes
  );

  console.log("this is the fetch for next batch");
  console.log(groupMessagesRes);
  console.log(groupMessagesOutput);

  dispatch<GetNextBatchGroupMessagesAction>({
    type: GET_NEXT_BATCH_GROUP_MESSAGES,
    groupMessagesOutput,
    groupId: Uint8ArrayToBase64(groupMessageBatchFetchFilter.groupId),
  });

  return groupMessagesOutput;
};

export const getMessagesByGroupByTimestamp = (
  groupMessageByDateFetchFilter: GroupMessageByDateFetchFilter
): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
): Promise<GroupMessagesOutput> => {
  // TODO: error handling
  // TODO: input sanitation
  const groupMessagesRes = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].GET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
    payload: groupMessageByDateFetchFilter,
  });

  let groupMessagesOutput: GroupMessagesOutput = convertFetchedResToGroupMessagesOutput(
    groupMessagesRes
  );

  dispatch<GetNextBatchGroupMessagesAction>({
    type: GET_NEXT_BATCH_GROUP_MESSAGES,
    groupMessagesOutput,
    groupId: Uint8ArrayToBase64(groupMessageByDateFetchFilter.groupId),
  });

  return groupMessagesOutput;
};

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

// helper function
const convertFetchedResToGroupMessagesOutput = (
  fetchedRes: any
): GroupMessagesOutput => {
  let messagesByGroup: MessagesByGroup = objectMap(
    fetchedRes.messagesByGroup,
    (message_ids: Uint8Array[]): string[] =>
      message_ids.map((message_id) => Uint8ArrayToBase64(message_id)),
    (group_id: string) => group_id.substring(1)
  );

  let groupMessagesContents: GroupMessagesContents = objectMap(
    fetchedRes.groupMessagesContents,
    (msg_content): GroupMessage => {
      return {
        groupMessageEntryHash: Uint8ArrayToBase64(
          msg_content.groupMessageElement.signedHeader.header.content.entry_hash
        ),
        groupEntryHash: Uint8ArrayToBase64(
          msg_content.groupMessageElement.entry.groupHash
        ),
        author: Uint8ArrayToBase64(
          msg_content.groupMessageElement.entry.sender
        ),
        payload: convertPayload(msg_content.groupMessageElement.entry.payload),
        timestamp: msg_content.groupMessageElement.entry.created,
        replyTo: msg_content.groupMessageElement.entry.replyTo,
        readList: msg_content.readList,
      };
    },
    (group_id: string) => group_id.substring(1)
  );

  let groupMessagesOutput: GroupMessagesOutput = {
    messagesByGroup,
    groupMessagesContents,
  };

  return groupMessagesOutput;
};

const convertPayload = (payload: any | TextPayload): Payload => {
  if (isTextPayload(payload)) return payload;
  if (isOther(payload.payload.fileType)) {
    return {
      type: "FILE",
      fileName: payload.payload.metadata.fileName,
      fileSize: payload.payload.metadata.fileSize,
      fileType: payload.payload.metadata.fileType,
      fileHash: payload.payload.metadata.fileHash,
    };
  } else {
    return {
      type: "FILE",

      fileName: payload.payload.metadata.fileName,
      fileSize: payload.payload.metadata.fileSize,
      fileType: payload.payload.metadata.fileType,
      fileHash: payload.payload.metadata.fileHash,
      thumbnail: payload.payload.fileType.thumbnail,
    };
  }
};

const fetchUsernameOfMembers = async (
  contactsState: ContactsState,
  members: string[],
  callZome: (config: CallZomeConfig) => Promise<any>
) => {
  // BUG: This contacts state is sometimes incomplete
  let contacts = contactsState.contacts;
  let undefinedProfiles: AgentPubKey[] = [];

  let membersUsernames: { [key: string]: Profile } = {};
  members.forEach((member) => {
    if (contacts[member]) {
      membersUsernames[member] = contacts[member];
    } else {
      undefinedProfiles.push(Buffer.from(base64ToUint8Array(member).buffer));
    }
  });

  if (undefinedProfiles?.length) {
    const res = await callZome({
      zomeName: ZOMES.USERNAME,
      fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
      payload: undefinedProfiles,
    });
    res.forEach((profile: any) => {
      let base64 = Uint8ArrayToBase64(profile.agentId);
      membersUsernames[base64] = { id: base64, username: profile.username };
    });
  }

  return membersUsernames;
};
