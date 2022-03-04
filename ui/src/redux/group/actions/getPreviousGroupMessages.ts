import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  GroupConversation,
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  SetGroupMessagesAction,
  SET_GROUP_MESSAGES,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

const getPreviousGroupMessages =
  (filter: GroupMessageBatchFetchFilter): ThunkAction =>
  async (dispatch, getState, { callZome }): Promise<GroupMessagesOutput> => {
    const state = getState();
    /* deserialize fields for zome fn */
    const input = {
      groupId: deserializeHash(filter.groupId),
      lastFetched: filter.lastFetched
        ? deserializeHash(filter.lastFetched)
        : undefined,
      lastMessageTimestamp: filter.lastMessageTimestamp
        ? dateToTimestamp(filter.lastMessageTimestamp)
        : undefined,
      batchSize: filter.batchSize,
      payloadType: filter.payloadType,
    };

    try {
      const groupMessagesRes = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].GET_PREVIOUS_GROUP_MESSAGES,
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
          : groupMessagesOutput.messagesByGroup[filter.groupId];

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
    } catch (e) {
      /* 
        No useful error is getting returned from
        the Guest/Host so we are simply returning a generic error here
      */
      return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default getPreviousGroupMessages;
