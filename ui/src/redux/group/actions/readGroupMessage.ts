import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { GroupMessageReadData } from "../types";

export const readGroupMessage =
  (groupMessageReadData: GroupMessageReadData): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    let res = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].READ_GROUP_MESSAGE,
      payload: groupMessageReadData,
    });
    console.log(res);
    return null;
  };
