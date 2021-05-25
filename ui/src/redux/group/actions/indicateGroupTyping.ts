import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { GroupTypingDetailData } from "../types";

export const indicateGroupTyping =
  (groupTypingDetailData: GroupTypingDetailData): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].INDICATE_GROUP_TYPING,
      payload: groupTypingDetailData,
    });
    return null;
  };
