import { serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../../utils/helpers";
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
        fileHash: serializeHash(
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
    let groupMessage: GroupMessage = {
      groupMessageId: serializeHash(payload.id),
      groupId: serializeHash(payload.content.groupHash),
      author: serializeHash(payload.content.sender),
      payload: handleGroupMessagePayload(payload),
      timestamp: timestampToDate(payload.content.created),
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
