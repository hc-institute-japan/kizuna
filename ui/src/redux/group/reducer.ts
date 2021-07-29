import { isTextPayload } from "../commons/types";
import { Profile } from "../profile/types";
import {
  ADD_GROUP,
  ADD_MEMBERS,
  GroupConversation,
  GroupConversationsActionTypes,
  GroupConversationsState,
  GroupMessage,
  GroupMessagesOutput,
  REMOVE_MEMBERS,
  SET_FILES_BYTES,
  SET_GROUP_MESSAGE,
  SET_GROUP_READ_MESSAGE,
  SET_GROUP_TYPING_INDICATOR,
  SET_LATEST_GROUP_STATE,
  SET_LATEST_GROUP_VERSION,
  SET_GROUP_MESSAGES,
  UPDATE_GROUP_NAME,
} from "./types";

const initialState: GroupConversationsState = {
  conversations: {},
  messages: {},
  groupFiles: {},
  members: {},
  typing: {},
};

const reducer = (
  state = initialState,
  action: GroupConversationsActionTypes
) => {
  switch (action.type) {
    case ADD_GROUP: {
      let groupEntryHash: string = action.groupData.originalGroupId;
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
        ...action.membersProfile,
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
      let groupId: string = groupMessage.groupId;
      let groupMessageId: string = groupMessage.groupMessageId;

      let groupConversation = state.conversations[groupId];
      // let prevGroupMessageIds = groupConversation.messages;

      /*
        New messageId should always be prepend as the first element of array
        for easy retrieval in the view.
        Question: Is unshift() better?
      */
      let messageIds = [
        groupMessage.groupMessageId,
        ...groupConversation.messages,
      ];

      let newMessage: { [key: string]: GroupMessage } = {
        [groupMessageId]: groupMessage,
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
        return {
          ...state,
          conversations: {
            ...state.conversations,
            [groupId]: { ...groupConversation, messages: messageIds },
          },
          messages,
          groupFiles,
        };
      } else {
        return {
          ...state,
          conversations: {
            ...state.conversations,
            [groupId]: { ...groupConversation, messages: messageIds },
          },
          messages,
        };
      }
    }
    case SET_FILES_BYTES:
      return {
        ...state,
        groupFiles: action.filesBytes,
      };
    case SET_GROUP_MESSAGES: {
      let groupConversations = state.conversations;
      let groupConversation: GroupConversation =
        groupConversations[action.groupId];

      let messageIds = groupConversation.messages
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
      return {
        ...state,
        messages,
        conversations: {
          ...groupConversations,
          [action.groupId]: { ...groupConversation, messages: messageIds },
        },
      };
    }
    case SET_LATEST_GROUP_STATE: {
      let groups: GroupConversation[] = action.groups;
      let groupMessagesOutput: GroupMessagesOutput = action.groupMessagesOutput;

      let conversations = state.conversations;
      groups.forEach((group: GroupConversation) => {
        conversations[group.originalGroupId] = group;
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
        [groupConversation.originalGroupId]: groupConversation,
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
    case SET_GROUP_TYPING_INDICATOR: {
      let typing = action.typing;
      let groupTyping = typing[action.groupTypingIndicator.groupId]
        ? typing[action.groupTypingIndicator.groupId]
        : [];
      const id = groupTyping.map((profile: Profile) => profile.id);
      if (action.groupTypingIndicator.isTyping) {
        if (!id.includes(action.groupTypingIndicator.indicatedBy.id)) {
          groupTyping.push(action.groupTypingIndicator.indicatedBy);
        }
      } else {
        groupTyping = groupTyping.filter((profile) => {
          return profile.id !== action.groupTypingIndicator.indicatedBy.id;
        });
      }

      typing = {
        ...typing,
        [action.groupTypingIndicator.groupId]: groupTyping,
      };

      return { ...state, typing };
    }
    case SET_GROUP_READ_MESSAGE: {
      return { ...state, messages: { ...action.messages } };
    }
    default:
      return state;
  }
};

export default reducer;
