import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import {
  GroupMessageByDateFetchFilter,
  GroupMessagesOutput,
  SetMessagesByGroupByTimestampAction,
  SET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

// TODO: Implement this in the UI first.
export const getMessagesByGroupByTimestamp =
  (groupMessageByDateFetchFilter: GroupMessageByDateFetchFilter): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<GroupMessagesOutput> => {
    const input = {
      groupId: deserializeHash(groupMessageByDateFetchFilter.groupId),
      date: dateToTimestamp(groupMessageByDateFetchFilter.date),
      payloadType: groupMessageByDateFetchFilter.payloadType,
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

    dispatch<SetMessagesByGroupByTimestampAction>({
      type: SET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
      groupMessagesOutput,
      groupId: groupMessageByDateFetchFilter.groupId,
    });

    return groupMessagesOutput;
  };
