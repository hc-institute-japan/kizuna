import {
  ADD_GROUP,
  UPDATE_GROUP_NAME,
  REMOVE_MEMBERS,
  ADD_MEMBERS,
  SET_GROUP_MESSAGE,
  SET_NEXT_BATCH_GROUP_MESSAGES,
  SET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
  GroupConversationsActionTypes,
  GroupConversation,
  GroupConversationsState,
  GroupMessage,
  SET_LATEST_GROUP_STATE,
  GroupMessagesOutput,
  SET_LATEST_GROUP_VERSION,
} from "./types";
import { isTextPayload } from "../commons/types";
import { Profile } from "../profile/types";

const initialState: GroupConversationsState = {
  conversations: {},
  messages: {},
  groupFiles: {},
  members: {},
};

const reducer = (
  state = initialState,
  action: GroupConversationsActionTypes
) => {
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
      let members = state.members;
      members = {
        ...members,
        ...action.membersUsernames,
      };
      return { ...state, conversations: groupConversations, members };
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
      let members = state.members;
      members = {
        ...members,
        ...action.membersUsernames,
      };
      return { ...state, conversations: groupConversations, members };
    }
    case REMOVE_MEMBERS: {
      let groupEntryHash: string = action.updateGroupMembersData.groupId;
      let removedMembers: string[] = action.updateGroupMembersData.members;
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
      let members = state.members;
      removedMembers.forEach((memberId: any) => {
        delete members[memberId];
      });
      return { ...state, conversations: groupConversations, members };
    }
    case UPDATE_GROUP_NAME: {
      let groupEntryHash: string = action.updateGroupNameData.groupId;
      let groupConversation: GroupConversation =
        state.conversations[groupEntryHash];
      groupConversation.name = action.updateGroupNameData.name;
      let groupConversations = state.conversations;
      groupConversations = {
        ...groupConversations,
        [groupEntryHash]: groupConversation,
      };
      return { ...state, conversations: groupConversations };
    }
    case SET_GROUP_MESSAGE: {
      let groupMessage: GroupMessage = action.groupMessage;
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
          [groupMessage.payload.fileHash]: action.fileBytes!,
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
    case SET_NEXT_BATCH_GROUP_MESSAGES: // fallthrough since its the same process with the next case
    case SET_MESSAGES_BY_GROUP_BY_TIMESTAMP: {
      let groupConversations = state.conversations;
      let groupConversation: GroupConversation =
        groupConversations[action.groupId];
      // we probably won't have any duplicates of hash but just in case we do we dedupe here
      groupConversation.messages = groupConversation.messages
        ? Array.from(
            new Set(
              groupConversation.messages.concat(
                action.groupMessagesOutput.messagesByGroup[action.groupId]
              )
            )
          )
        : groupConversations[action.groupId].messages;
      groupConversations = {
        ...groupConversations,
        [action.groupId]: groupConversation,
      };
      let messages = state.messages;
      messages = {
        ...messages,
        ...action.groupMessagesOutput.groupMessagesContents,
      };
      return { ...state, messages, conversations: groupConversations };
    }
    case SET_LATEST_GROUP_STATE: {
      let groups: GroupConversation[] = action.groups;
      let groupMessagesOutput: GroupMessagesOutput = action.groupMessagesOutput;

      let conversations = state.conversations;
      groups.forEach((group: GroupConversation) => {
        conversations[group.originalGroupEntryHash] = group;
      });

      let messages = state.messages;
      messages = {
        ...messages,
        ...groupMessagesOutput.groupMessagesContents,
      };

      let members = state.members;
      action.members.forEach((member: Profile) => {
        members[member.id] = member;
      });
      return { ...state, conversations, messages, members };
    }
    case SET_LATEST_GROUP_VERSION: {
      let groupConversations = state.conversations;
      let groupConversation: GroupConversation = action.groupData;
      groupConversations = {
        ...groupConversations,
        [groupConversation.originalGroupEntryHash]: groupConversation,
      };

      let messages = state.messages;
      messages = {
        ...messages,
        ...action.groupMessagesOutput.groupMessagesContents,
      };

      let members = state.members;
      Object.keys(action.membersUsernames).forEach((key: string) => {
        members[key] = action.membersUsernames[key];
      });

      return { ...state, conversations: groupConversations, members, messages };
    }
    default:
      return state;
  }
};

export default reducer;
