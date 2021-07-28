import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  GroupMessagAdjacentFetchFilter,
  GroupMessagesOutput,
  SetGroupMessagesAction,
  SET_GROUP_MESSAGES,
} from "../types";
import { convertFetchedResToGroupMessagesOutput } from "./helpers";

const getAdjacentGroupMessages =
  (filter: GroupMessagAdjacentFetchFilter): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<GroupMessagesOutput> => {
    /* deserialize fields for zome fn */
    const input = {
      groupId: deserializeHash(filter.groupId),
      adjacentMessage: deserializeHash(filter.adjacentMessage),
      messageTimestamp: dateToTimestamp(filter.messageTimestamp),
      batchSize: filter.batchSize,
    };

    try {
      const groupMessagesRes = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].GET_ADJACENT_GROUP_MESSAGES,
        payload: input,
      });

      const groupMessagesOutput: GroupMessagesOutput =
        convertFetchedResToGroupMessagesOutput(groupMessagesRes);

      dispatch<SetGroupMessagesAction>({
        type: SET_GROUP_MESSAGES,
        groupMessagesOutput,
        groupId: filter.groupId,
      });

      return groupMessagesOutput;
    } catch (e) {
      /* 
        No useful error is getting returned from
        the Guest/Host so we are simply returning a generic error here
      */
      return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default getAdjacentGroupMessages;
