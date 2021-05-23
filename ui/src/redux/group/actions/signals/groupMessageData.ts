import { Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { isImage, isOther, isTextPayload } from "../../../commons/types";
import { ThunkAction } from "../../../types";
import {
  GroupMessage,
  SetGroupMessageAction,
  SET_GROUP_MESSAGE,
} from "../../types";

const handleGroupMessagePayload = (payload: any) =>
  isTextPayload(payload.content.payload)
    ? payload.content.payload
    : {
        type: "FILE",
        fileName: payload.content.payload.payload.metadata.fileName,
        fileSize: payload.content.payload.payload.metadata.fileSize,
        fileType: isOther(payload.content.payload.payload.fileType)
          ? "OTHER"
          : isImage(payload.content.payload.payload.fileType)
          ? "IMAGE"
          : "VIDEO",
        fileHash: Uint8ArrayToBase64(
          payload.content.payload.payload.metadata.fileHash
        ),
        thumbnail: isOther(payload.content.payload.payload.fileType)
          ? undefined
          : payload.content.payload.payload.fileType.payload.thumbnail,
      };

const groupMessageData =
  (signalPayload: any): ThunkAction =>
  async (dispatch) => {
    const { payload } = signalPayload;
    console.log(payload);
    let groupMessage: GroupMessage = {
      groupMessageEntryHash: Uint8ArrayToBase64(payload.id),
      groupEntryHash: Uint8ArrayToBase64(payload.content.groupHash),
      author: Uint8ArrayToBase64(payload.content.sender),
      payload: handleGroupMessagePayload(payload),
      timestamp: payload.content.created,
      // TODO: work on this
      // replyTo: undefined,
      readList: {},
    };
    dispatch<SetGroupMessageAction>({
      type: SET_GROUP_MESSAGE,
      groupMessage,
    });
  };

export default groupMessageData;
