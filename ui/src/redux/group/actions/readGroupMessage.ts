import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { GroupMessageReadData } from "../types";

export const readGroupMessage =
  (groupMessageReadData: GroupMessageReadData): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    /* deserialize fields for zome fn */
    const input = {
      groupId: deserializeHash(groupMessageReadData.groupId),
      messageIds: groupMessageReadData.messageIds.map((messageId: string) =>
        deserializeHash(messageId)
      ),
      reader: groupMessageReadData.reader,
      timestamp: dateToTimestamp(groupMessageReadData.timestamp),
      members: groupMessageReadData.members,
    };
    await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].READ_GROUP_MESSAGE,
      payload: input,
    });
    return null;
  };
