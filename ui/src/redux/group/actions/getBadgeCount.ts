import { ThunkAction } from "../../types";
import { GroupConversation } from "../types";

export const getGroupConversationBadgeCount =
  (groupId: string): ThunkAction =>
  (_dispatch, getState) => {
    const state = getState();
    const myAgentId = state.profile.id;
    const groupConversation: GroupConversation =
      state.groups.conversations[groupId];
    const allGroupMessages = state.groups.messages;

    /* 
      filter messageIds that corresponds to messages sent by own
      and then return the ReadList of each of the messages
    */
    const readLists = groupConversation.messages
      .filter(
        (messageId: string) => allGroupMessages[messageId].author !== myAgentId
      )
      .map((messageId: string) => allGroupMessages[messageId].readList);

    /* 
      filter each readList of a message and see if own AgentId is 
      present as key in the readList object.
    */
    const badgeCount = readLists.filter((readList: { [key: string]: Date }) => {
      return readList[myAgentId!] === undefined;
    }).length;

    return badgeCount;
  };
