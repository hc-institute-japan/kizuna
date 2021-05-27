import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { Uint8ArrayToBase64 } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import {
  GroupMessageByDateFetchFilter,
  GroupMessagesOutput,
  SetMessagesByGroupByTimestampAction,
  SET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

export const getMessagesByGroupByTimestamp =
  (groupMessageByDateFetchFilter: GroupMessageByDateFetchFilter): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<GroupMessagesOutput> => {
    // TODO: error handling
    // TODO: input sanitation
    const groupMessagesRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
      payload: groupMessageByDateFetchFilter,
    });

    let groupMessagesOutput: GroupMessagesOutput =
      convertFetchedResToGroupMessagesOutput(groupMessagesRes);

    dispatch<SetMessagesByGroupByTimestampAction>({
      type: SET_MESSAGES_BY_GROUP_BY_TIMESTAMP,
      groupMessagesOutput,
      groupId: Uint8ArrayToBase64(groupMessageByDateFetchFilter.groupId),
    });

    return groupMessagesOutput;
  };
