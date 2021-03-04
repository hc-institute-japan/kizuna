import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import {
  ADD_GROUP,
  ADD_MEMBERS,
  REMOVE_MEMBERS,
  UPDATE_GROUP_NAME,
  createGroupInput,
  GroupConversation,
  UpdateGroupMembersIO,
  UpdateGroupNameIO,
} from "./types";

export const createGroup = (
  create_group_input: createGroupInput
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

export const sendGroupMessage = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {};

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
