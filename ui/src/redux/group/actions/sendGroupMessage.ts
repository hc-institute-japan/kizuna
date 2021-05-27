import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { Uint8ArrayToBase64 } from "../../../utils/helpers";
import {
  // action types
  SET_GROUP_MESSAGE,
  // IO
  GroupMessageInput,
  GroupMessage,
  // action payload types
  SetGroupMessageAction,
} from "../types";
import {
  Payload,
  FilePayload,
  FileType,
  // type guards
  isTextPayload,
  isOther,
  isImage,
} from "../../commons/types";
import { setFilesBytes } from "./setFilesBytes";

export const sendGroupMessage =
  (groupMessageData: GroupMessageInput): ThunkAction =>
  async (dispatch, getState, { callZome }): Promise<GroupMessage> => {
    // TODO: error handling
    if (isTextPayload(groupMessageData.payloadInput)) {
      let message = groupMessageData.payloadInput.payload.payload;
      groupMessageData.payloadInput.payload = { payload: message.trim() };
    }

    const sendGroupMessageOutput = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
      payload: groupMessageData,
    });

    let payload: Payload;
    let fileBytes: Uint8Array | undefined;
    if (isTextPayload(groupMessageData.payloadInput)) {
      payload = sendGroupMessageOutput.content.payload;
    } else {
      let fileType: FileType =
        sendGroupMessageOutput.content.payload.payload.fileType;
      let thumbnail: Uint8Array | undefined = isOther(fileType)
        ? undefined
        : isImage(fileType)
        ? fileType.payload.thumbnail
        : fileType.payload.thumbnail;
      fileBytes = groupMessageData.payloadInput.payload.fileBytes;
      if (fileType.type === "VIDEO") {
        const fetchedFileBytes = await callZome({
          zomeName: ZOMES.GROUP,
          fnName: FUNCTIONS[ZOMES.GROUP].GET_FILES_BYTES,
          payload: [
            sendGroupMessageOutput.content.payload.payload.metadata.fileHash,
          ],
        });

        if (fetchedFileBytes?.type !== "error") {
          dispatch(setFilesBytes({ ...fetchedFileBytes }));
        }
      }
      let filePayload: FilePayload = {
        type: "FILE",
        fileName:
          sendGroupMessageOutput.content.payload.payload.metadata.fileName,
        fileSize:
          sendGroupMessageOutput.content.payload.payload.metadata.fileSize,
        fileType:
          sendGroupMessageOutput.content.payload.payload.metadata.fileType,
        fileHash: Uint8ArrayToBase64(
          sendGroupMessageOutput.content.payload.payload.metadata.fileHash
        ),
        thumbnail,
      };
      payload = filePayload;
    }

    let groupMessageDataFromRes: GroupMessage = {
      groupMessageEntryHash: Uint8ArrayToBase64(sendGroupMessageOutput.id),
      groupEntryHash: Uint8ArrayToBase64(
        sendGroupMessageOutput.content.groupHash
      ),
      author: Uint8ArrayToBase64(sendGroupMessageOutput.content.sender),
      payload,
      timestamp: sendGroupMessageOutput.content.created,
      replyTo: !sendGroupMessageOutput.content.replyTo
        ? undefined
        : Uint8ArrayToBase64(sendGroupMessageOutput.content.replyTo),
      readList: {},
    };

    dispatch<SetGroupMessageAction>({
      type: SET_GROUP_MESSAGE,
      groupMessage: groupMessageDataFromRes,
      fileBytes,
    });

    return groupMessageDataFromRes;
  };
