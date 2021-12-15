import { isTextPayload, Payload } from "../../commons/types";
import { ThunkAction } from "../../types";
import {
  GroupMessageBundle,
  GroupMessageInput,
  SetGroupErrMessageAction,
  SET_ERR_GROUP_MESSAGE,
} from "../types";

// TODO: cache error messages
const setErrGroupMessage =
  (errMsg: GroupMessageInput): ThunkAction =>
  async (dispatch, getState) => {
    const { id, username, fields } = getState().profile;
    const groups = getState().groups;
    let payload: Payload | null;
    if (isTextPayload(errMsg.payloadInput)) {
      payload = {
        type: "TEXT",
        payload: { payload: errMsg.payloadInput.payload.payload },
      };
    } else {
      payload = {
        type: "FILE",
        fileName: errMsg.payloadInput.payload.metadata.fileName,
        fileSize: errMsg.payloadInput.payload.metadata.fileSize,
        fileType: errMsg.payloadInput.payload.fileType.type,
        fileBytes: errMsg.payloadInput.payload.fileBytes,
        thumbnail: errMsg.payloadInput.payload.fileType.payload?.thumbnail,
      };
    }
    const msg: GroupMessageBundle = {
      groupMessageId: "error message", // TODO: use a unique id
      groupId: errMsg.groupId,
      author: { username: username!, id: id!, fields },
      payload: payload,
      timestamp: new Date(),
      replyTo:
        errMsg.replyTo && groups.messages[errMsg.replyTo]
          ? {
              groupId: groups.messages[errMsg.replyTo].groupId,
              author: groups.messages[errMsg.replyTo].author,
              payload: groups.messages[errMsg.replyTo].payload,
              timestamp: groups.messages[errMsg.replyTo].timestamp,
              replyTo: undefined,
              readList: groups.messages[errMsg.replyTo].readList,
            }
          : undefined,
      replyToId: errMsg.replyTo ? errMsg.replyTo : undefined,
      readList: {},
      err: true,
    };

    let allErrMessages = groups.errMsgs;
    let groupErrMessages = allErrMessages[msg.groupId]
      ? groups.errMsgs[msg.groupId]
      : [];
    allErrMessages = {
      ...allErrMessages,
      [msg.groupId]: [msg, ...groupErrMessages],
    };

    dispatch<SetGroupErrMessageAction>({
      type: SET_ERR_GROUP_MESSAGE,
      errMsgs: allErrMessages,
    });
  };

export default setErrGroupMessage;
