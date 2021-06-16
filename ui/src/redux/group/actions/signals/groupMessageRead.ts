import { serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { SetGroupReadMessage, SET_GROUP_READ_MESSAGE } from "../../types";

const groupMessageRead =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState) => {
    const { payload } = signalPayload;
    const state = getState();
    /* 
    There is a case where the read signal comes first from another agent
    before the groupMessage has arrived (whether through signal or with getters).
    This is because there is really no guarantee of order in the receiving of signals.
    And in the case that read signal comes first before groupMessage,
    we should simply ignore the signal for read since there is no
    message yet to attach the read status to.
    */
    const messagesArrived = payload.messageIds
      .map((messageId: Uint8Array) => serializeHash(messageId))
      .filter((messageId: string) => state.groups.messages[messageId]);
    dispatch<SetGroupReadMessage>({
      type: SET_GROUP_READ_MESSAGE,
      GroupReadMessage: {
        groupId: serializeHash(payload.groupId),
        messageIds: messagesArrived,
        reader: serializeHash(payload.reader),
        timestamp: timestampToDate(payload.timestamp),
      },
    });
  };

export default groupMessageRead;
