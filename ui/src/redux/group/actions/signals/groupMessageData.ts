import { serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../../utils/services/DateService";

import {
  FilePayload,
  FilePayloadInput,
  isImage,
  isOther,
  isTextPayload,
  TextPayload,
} from "../../../commons/types";
import { ThunkAction } from "../../../types";
import {
  GroupConversation,
  GroupMessage,
  SetGroupMessageAction,
  SET_GROUP_MESSAGE,
} from "../../types";

const handleGroupMessagePayload = (payload: any) =>
  isTextPayload(payload as TextPayload | FilePayloadInput | FilePayload)
    ? payload
    : {
        type: "FILE",
        fileName: payload.payload.metadata.fileName,
        fileSize: payload.payload.metadata.fileSize,
        fileType: isOther(payload.payload.fileType)
          ? "OTHER"
          : isImage(payload.payload.fileType)
          ? "IMAGE"
          : "VIDEO",
        fileHash: serializeHash(payload.payload.metadata.fileHash),
        thumbnail: isOther(payload.payload.fileType)
          ? undefined
          : payload.payload.fileType.payload.thumbnail,
      };

const groupMessageData =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState) => {
    const { payload } = signalPayload;
    const state = getState();
    const groupMessage: GroupMessage = {
      groupMessageId: serializeHash(payload.messageId),
      groupId: serializeHash(payload.groupHash),
      author: serializeHash(payload.sender),
      payload: handleGroupMessagePayload(payload.payload),
      timestamp: timestampToDate(payload.created),
      replyTo: payload.replyTo
        ? {
            groupId: serializeHash(payload.replyTo.content.groupHash),
            author: serializeHash(payload.replyTo.content.sender),
            payload: handleGroupMessagePayload(payload.replyTo.content.payload),
            timestamp: timestampToDate(payload.replyTo.content.created),
            /*
              TODO: currently undefined but we will have to modify this once jumping
              to replied message will be possible.
            */
            replyTo: undefined,
            readList: {},
          }
        : undefined,
      /* assume no one read the message since it just arrived as signal to the recepient */
      readList: {},
    };

    const groupId: string = groupMessage.groupId;
    const groupMessageId: string = groupMessage.groupMessageId;
    const groupConversation = state.groups.conversations[groupId];
    const currMessages = groupConversation ? groupConversation.messages : [];

    const messageIds = [groupMessage.groupMessageId, ...currMessages];

    const newMessage: { [key: string]: GroupMessage } = {
      [groupMessageId]: groupMessage,
    };
    let messages = state.groups.messages;
    messages = {
      ...messages,
      ...newMessage,
    };
    const groupFiles = state.groups.groupFiles;
    const conversations: {
      [key: string]: GroupConversation;
    } = {
      ...state.groups.conversations,
      [groupId]: { ...groupConversation, messages: messageIds },
    };

    dispatch<SetGroupMessageAction>({
      type: SET_GROUP_MESSAGE,
      conversations,
      messages,
      groupFiles,
    });
  };

export default groupMessageData;
