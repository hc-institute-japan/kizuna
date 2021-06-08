import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import {
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  SetNextBatchGroupMessagesAction,
  SET_NEXT_BATCH_GROUP_MESSAGES,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

export const getNextBatchGroupMessages =
  (groupMessageBatchFetchFilter: GroupMessageBatchFetchFilter): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<GroupMessagesOutput> => {
    /* deserialize fields for zome fn */
    const input = {
      groupId: deserializeHash(groupMessageBatchFetchFilter.groupId),
      lastFetched: groupMessageBatchFetchFilter.lastFetched
        ? deserializeHash(groupMessageBatchFetchFilter.lastFetched)
        : undefined,
      lastMessageTimestamp: groupMessageBatchFetchFilter.lastMessageTimestamp
        ? dateToTimestamp(groupMessageBatchFetchFilter.lastMessageTimestamp)
        : undefined,
      batchSize: groupMessageBatchFetchFilter.batchSize,
      payloadType: groupMessageBatchFetchFilter.payloadType,
    };

    // TODO: error handling
    // TODO: input sanitation
    const groupMessagesRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_NEXT_BATCH_GROUP_MESSAGES,
      payload: input,
    });

    const groupMessagesOutput: GroupMessagesOutput =
      convertFetchedResToGroupMessagesOutput(groupMessagesRes);

    dispatch<SetNextBatchGroupMessagesAction>({
      type: SET_NEXT_BATCH_GROUP_MESSAGES,
      groupMessagesOutput,
      groupId: groupMessageBatchFetchFilter.groupId,
    });

    return groupMessagesOutput;
  };
