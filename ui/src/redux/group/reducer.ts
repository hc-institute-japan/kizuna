import { AgentPubKey } from "@holochain/conductor-api";
import {
  ADD_GROUP,
  UPDATE_GROUP_NAME,
  REMOVE_MEMBERS,
  ADD_MEMBERS,
  SEND_GROUP_MESSAGE,
  GroupConversation,
  GroupConversationsState,
  isTextPayload,
  GroupMessage,
  GroupConversationsActionTypes,
} from "./types";

const initialState: GroupConversationsState = {
  conversations: {},
  messages: {},
  groupFiles: {},
};

// TODO: action here should have a better type
const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ADD_GROUP: {
      let groupEntryHash: string = action.groupData.originalGroupEntryHash;
      let newConversation: { [key: string]: GroupConversation } = {
        [groupEntryHash]: action.groupData,
      };
      let groupConversations = state.conversations;
      groupConversations = {
        ...groupConversations,
        ...newConversation,
      };
      return { ...state, conversations: groupConversations };
    }
    case ADD_MEMBERS: {
      let groupEntryHash: string = action.updateGroupMembersData.groupId;
      let groupConversation: GroupConversation =
        state.conversations[groupEntryHash];
      groupConversation.members = groupConversation.members.concat(
        action.updateGroupMembersData.members
      );
      let groupConversations = state.conversations;
      groupConversations = {
        ...groupConversations,
        [groupEntryHash]: groupConversation,
      };
      return { ...state, conversations: groupConversations };
    }
    case REMOVE_MEMBERS: {
      let groupEntryHash: string = action.updateGroupMembersData.groupId;
      let removedMembers: AgentPubKey[] = action.updateGroupMembersData.members;
      let groupConversation: GroupConversation =
        state.conversations[groupEntryHash];
      groupConversation.members = groupConversation.members.filter(
        (x) => !removedMembers.includes(x)
      );
      let groupConversations = state.conversations;
      groupConversations = {
        ...groupConversations,
        [groupEntryHash]: groupConversation,
      };
      return { ...state, conversations: groupConversations };
    }
    case UPDATE_GROUP_NAME: {
      let groupEntryHash: string = action.UpdateGroupNameIO.groupId;
      let groupConversation: GroupConversation =
        state.conversations[groupEntryHash];
      groupConversation.name = action.UpdateGroupNameIO.name;
      let groupConversations = state.conversations;
      groupConversations = {
        ...groupConversations,
        [groupEntryHash]: groupConversation,
      };
      return { ...state, conversations: groupConversations };
    }
    case SEND_GROUP_MESSAGE: {
      let groupMessage: GroupMessage = action.GroupMessage;
      let groupEntryHash: string = groupMessage.groupEntryHash;
      let groupMessageEntryHash: string = groupMessage.groupMessageEntryHash;
      let groupConversation: GroupConversation =
        state.conversations[groupEntryHash];
      groupConversation.messages.push(groupMessage.groupMessageEntryHash);
      let newMessage: { [key: string]: GroupMessage } = {
        [groupMessageEntryHash]: groupMessage,
      };
      let messages = state.messages;
      messages = {
        ...messages,
        ...newMessage,
      };

      if (!isTextPayload(groupMessage.payload)) {
        // work with file payload
        let groupFiles = state.groupFiles;
        let newFile: { [key: string]: Uint8Array } = {
          [groupMessage.payload.fileHash]: action.fileBytes,
        };
        groupFiles = {
          ...groupFiles,
          ...newFile,
        };
        return { ...state, messages, groupFiles };
      } else {
        return { ...state, messages };
      }
    }
    default:
      return state;
  }
};

export default reducer;
