import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/HolochainService/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { GroupMessageReadData } from "../types";

const readGroupMessage =
  (groupMessageReadData: GroupMessageReadData): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
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
    try {
      await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].READ_GROUP_MESSAGE,
        payload: input,
      });
    } catch (e) {
      /*
      The error that could be returned here is of internal_error from create_link
      but we ignore it since we don't have a workaround on this aotm.
      See https://github.com/hc-institute-japan/kizuna/issues/54
      */
    }
    return null;
  };

export default readGroupMessage;
