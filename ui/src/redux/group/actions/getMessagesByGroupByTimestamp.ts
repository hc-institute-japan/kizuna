import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/HolochainService/types";
import { dateToTimestamp } from "../../../utils/services/DateService";
import { ThunkAction } from "../../types";
import {
  GroupConversation,
  GroupMessageByDateFetchFilter,
  GroupMessagesOutput,
  SetGroupMessagesAction,
  SET_GROUP_MESSAGES,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

// TODO: Implement this in the UI first.
const getMessagesByGroupByTimestamp =
  (filter: GroupMessageByDateFetchFilter): ThunkAction =>
  async (dispatch, getState, { callZome }): Promise<GroupMessagesOutput> => {
    const state = getState();
    const input = {
      groupId: deserializeHash(filter.groupId),
      date: dateToTimestamp(filter.date),
      payloadType: filter.payloadType,
    };

    // TODO: error handling
    // TODO: input sanitation
    const groupMessagesRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
      payload: input,
    });

    const groupMessagesOutput: GroupMessagesOutput =
      convertFetchedResToGroupMessagesOutput(groupMessagesRes);

    let groupConversations = state.groups.conversations;
    const groupConversation: GroupConversation =
      groupConversations[filter.groupId];

    if (groupConversation) {
      const messageIds = groupConversation.messages
        ? Array.from(
            new Set(
              groupConversation.messages.concat(
                groupMessagesOutput.messagesByGroup[filter.groupId]
              )
            )
          )
        : groupConversations[filter.groupId].messages;

      groupConversations = {
        ...groupConversations,
        [filter.groupId]: groupConversation,
      };
      let messages = state.groups.messages;
      messages = {
        ...messages,
        ...groupMessagesOutput.groupMessagesContents,
      };

      const conversations: {
        [key: string]: GroupConversation;
      } = {
        ...groupConversations,
        [filter.groupId]: { ...groupConversation, messages: messageIds },
      };

      dispatch<SetGroupMessagesAction>({
        type: SET_GROUP_MESSAGES,
        conversations,
        messages,
      });
    }

    return groupMessagesOutput;
  };

export default getMessagesByGroupByTimestamp;
