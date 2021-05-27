import { Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { SetGroupReadMessage, SET_GROUP_READ_MESSAGE } from "../../types";

const groupMessageRead =
  (signalPayload: any): ThunkAction =>
  async (dispatch) => {
    const { payload } = signalPayload;
    dispatch<SetGroupReadMessage>({
      type: SET_GROUP_READ_MESSAGE,
      GroupReadMessage: {
        groupId: Uint8ArrayToBase64(payload.groupId),
        messageIds: payload.messageIds.map((messageId: Uint8Array) =>
          Uint8ArrayToBase64(messageId)
        ),
        reader: Uint8ArrayToBase64(payload.reader),
        timestamp: payload.timestamp,
      },
    });
  };

export default groupMessageRead;
