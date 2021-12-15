import { FileContent } from "../../../components/MessageInput";
import { Payload } from "../../commons/types";
import { ThunkAction } from "../../types";
import { P2PMessage, SetErrMessageAction, SET_ERR_MESSAGE } from "../types";

export const setErrorMessage =
  (
    receiver: string,
    text: string,
    type: string,
    replyTo?: string,
    file?: FileContent
  ): ThunkAction =>
  (dispatch, getState) => {
    const { id, username, fields } = getState().profile;
    const contacts = getState().contacts.contacts;
    const { messages } = getState().p2pmessages;

    let payload: Payload;
    if (type === "TEXT") {
      payload = {
        type: "TEXT",
        payload: { payload: text.trim() },
      };
    } else {
      payload = {
        type: "FILE",
        fileName: file!.metadata.fileName,
        fileSize: file!.metadata.fileSize,
        fileType: file!.fileType.type,
        fileBytes: file!.fileBytes,
        thumbnail: file!.fileType.payload?.thumbnail,
      };
    }
    let message: P2PMessage = {
      p2pMessageEntryHash: "error message", // TODO: use a unique ID
      author: { id: id!, username: username!, fields },
      receiver: {
        id: receiver,
        username: contacts[receiver].username!,
        fields: contacts[receiver].fields,
      },
      payload: payload,
      timestamp: new Date(),
      replyTo:
        replyTo && messages[replyTo]
          ? {
              p2pMessageEntryHash: messages[replyTo].p2pMessageEntryHash,
              author: messages[replyTo].author,
              receiver: messages[replyTo].receiver,
              payload: messages[replyTo].payload,
              timestamp: messages[replyTo].timestamp,
              replyTo: undefined,
              receipts: [],
            }
          : undefined,
      receipts: [],
      replyToId: replyTo,
      err: true,
    };

    let allErrMsgs = getState().p2pmessages.errMsgs;
    let thisErrMsgs = getState().p2pmessages.errMsgs[receiver]
      ? getState().p2pmessages.errMsgs[receiver]
      : [];
    allErrMsgs = {
      ...allErrMsgs,
      [receiver]: [message, ...thisErrMsgs],
    };

    dispatch<SetErrMessageAction>({
      type: SET_ERR_MESSAGE,
      state: {
        errMsgs: allErrMsgs,
      },
    });
    return true;
  };
