import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { GroupConversation } from "../types";

export const getGroupConversationBadgeCount =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { getAgentId }) => {
    const myAgentId = await getAgentId();
    /* tatssato: myAgentId AFAIK is non-nullable */
    const myAgentIdB64 = serializeHash(myAgentId!);
    const state = getState();

    const groupConversation: GroupConversation =
      state.groups.conversations[groupId];
    const allGroupMessages = state.groups.messages;

    /* 
      filter messageIds that corresponds to messages sent by own
      and then return the ReadList of each of the messages
    */
    const readLists = groupConversation.messages
      .filter(
        (messageId: string) =>
          allGroupMessages[messageId].author !== myAgentIdB64
      )
      .map((messageId: string) => allGroupMessages[messageId].readList);

    /* 
      filter each readList of a message and see if own AgentId is 
      present as key in the readList object.
    */
    let badgeCount = readLists.filter(
      (readList: { [key: string]: Date }) =>
        readList[myAgentIdB64] !== undefined
    ).length;

    return badgeCount;
  };
