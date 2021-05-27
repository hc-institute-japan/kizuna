import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../../types";
import { SetGroupReadMessage, SET_GROUP_READ_MESSAGE } from "../../types";

const groupMessageRead =
  (signalPayload: any): ThunkAction =>
  async (dispatch) => {
    const { payload } = signalPayload;
    dispatch<SetGroupReadMessage>({
      type: SET_GROUP_READ_MESSAGE,
      GroupReadMessage: {
        groupId: serializeHash(payload.groupId),
        messageIds: payload.messageIds.map((messageId: Uint8Array) =>
          serializeHash(messageId)
        ),
        reader: serializeHash(payload.reader),
        timestamp: payload.timestamp,
      },
    });
  };

export default groupMessageRead;
