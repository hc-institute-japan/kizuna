import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { CombinedState } from "redux";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { timestampToDate } from "../../../utils/helpers";
import {
  FilePayload,
  FileType,
  isImage,
  isOther,
  // type guards
  isTextPayload,
  isVideo,
  Payload,
} from "../../commons/types";
import { ContactsState } from "../../contacts/types";
import { pushError } from "../../error/actions";
import { ErrorState } from "../../error/types";
import { LanguageState } from "../../language/types";
import { P2PMessageConversationState } from "../../p2pmessages/types";
import { PreferenceState } from "../../preference/types";
import { ProfileState } from "../../profile/types";
import { CallZomeConfig, ThunkAction } from "../../types";
import { setFilesBytes } from "../actions";
import {
  GroupConversation,
  GroupConversationsState,
  GroupMessage,
  // IO
  GroupMessageInput,
  // action types
  SET_GROUP_MESSAGE,
} from "../types";

const setGroupMessage = async (
  sendGroupMessageOutput: any,
  groupMessageData: GroupMessageInput,
  callZome: (config: CallZomeConfig) => Promise<any>,
  getState: () => CombinedState<{
    profile: ProfileState;
    contacts: ContactsState;
    preference: PreferenceState;
    groups: GroupConversationsState;
    p2pmessages: P2PMessageConversationState;
    language: LanguageState;
    error: ErrorState;
  }>,
  dispatch: any
) => {
  let payload: Payload;
  let fileBytes: Uint8Array | undefined;

  /* convert the payload returned from HC to UI appropriate payload type */
  if (isTextPayload(groupMessageData.payloadInput)) {
    payload = sendGroupMessageOutput.content.payload;
  } else {
    let fileType: FileType =
      sendGroupMessageOutput.content.payload.payload.fileType;
    /* set the thumbnail if the file type is either a media or video */
    let thumbnail: Uint8Array | undefined = isOther(fileType)
      ? undefined
      : isImage(fileType)
      ? fileType.payload.thumbnail
      : isVideo(fileType)
      ? fileType.payload.thumbnail
      : undefined;
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
    const filePayload: FilePayload = {
      type: "FILE",
      fileName:
        sendGroupMessageOutput.content.payload.payload.metadata.fileName,
      fileSize:
        sendGroupMessageOutput.content.payload.payload.metadata.fileSize,
      fileType:
        sendGroupMessageOutput.content.payload.payload.metadata.fileType,
      fileHash: serializeHash(
        sendGroupMessageOutput.content.payload.payload.metadata.fileHash
      ),
      thumbnail,
    };
    payload = filePayload;
  }
  const message = sendGroupMessageOutput.content.replyTo
    ? getState().groups.messages[
        serializeHash(sendGroupMessageOutput.content.replyTo)
      ]
    : null;

  /* the final GroupMessage data type converted from the returned value of the Zome fn above */
  const groupMessageDataConverted: GroupMessage = {
    groupMessageId: serializeHash(sendGroupMessageOutput.id),
    groupId: serializeHash(sendGroupMessageOutput.content.groupHash),
    author: serializeHash(sendGroupMessageOutput.content.sender),
    payload,
    timestamp: timestampToDate(sendGroupMessageOutput.content.created),
    replyTo: message
      ? {
          groupId: message.groupId,
          author: message.author,
          payload: message.payload,
          timestamp: message.timestamp,
          /*
            TODO: currently undefined but we will have to modify this once jumping
            to replied message will be possible.
          */
          replyTo: undefined,
          readList: {},
        }
      : undefined,
    readList: {},
  };

  const groupId: string = groupMessageDataConverted.groupId;
  const groupMessageId: string = groupMessageDataConverted.groupMessageId;
  const groupConversation = getState().groups.conversations[groupId];

  const messageIds = [
    groupMessageDataConverted.groupMessageId,
    ...groupConversation.messages,
  ];
  const newMessage: { [key: string]: GroupMessage } = {
    [groupMessageId]: groupMessageDataConverted,
  };
  let messages = getState().groups.messages;
  messages = {
    ...messages,
    ...newMessage,
  };

  let groupFiles = getState().groups.groupFiles;
  if (!isTextPayload(groupMessageDataConverted.payload)) {
    // work with file payload
    const newFile: { [key: string]: Uint8Array } = {
      [groupMessageDataConverted.payload.fileHash!]: fileBytes!,
    };
    groupFiles = {
      ...groupFiles,
      ...newFile,
    };
  }

  const conversations: {
    [key: string]: GroupConversation;
  } = {
    ...getState().groups.conversations,
    [groupId]: { ...groupConversation, messages: messageIds },
  };

  dispatch({
    type: SET_GROUP_MESSAGE,
    conversations,
    messages,
    groupFiles,
  });

  return groupMessageDataConverted;
};

const sendGroupMessage =
  (groupMessageData: GroupMessageInput): ThunkAction =>
  async (dispatch, getState, { callZome, retry }) => {
    if (isTextPayload(groupMessageData.payloadInput)) {
      let message = groupMessageData.payloadInput.payload.payload;
      /* input sanitization for text payload */
      groupMessageData.payloadInput.payload = { payload: message.trim() };
    }

    /* deserialize fields for zome fn */
    const input = {
      groupHash: deserializeHash(groupMessageData.groupId),
      payloadInput: groupMessageData.payloadInput,
      sender: deserializeHash(groupMessageData.sender),
      replyTo: groupMessageData.replyTo
        ? deserializeHash(groupMessageData.replyTo)
        : undefined,
    };

    try {
      // const sendGroupMessageOutput = await callZome({
      //   zomeName: ZOMES.GROUP,
      //   fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
      //   payload: input,
      // });
      // return await setGroupMessage(
      //   sendGroupMessageOutput,
      //   groupMessageData,
      //   callZome,
      //   getState,
      //   dispatch
      // );
      return false;
    } catch (e) {
      try {
        if (!(e as any).message.includes("Timed out")) {
          const sendGroupMessageOutput = retry({
            zomeName: ZOMES.GROUP,
            fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
            payload: input,
          });
          return await setGroupMessage(
            sendGroupMessageOutput,
            groupMessageData,
            callZome,
            getState,
            dispatch
          );
        } else {
          return dispatch(
            pushError("TOAST", {}, { id: "redux.err.conductor-time-out" })
          );
        }
      } catch (e) {
        handleError(e, dispatch, groupMessageData);
        console.log("sending of group message has failed", e);
        return false;
      }
    }
  };

const handleError = (
  e: any,
  dispatch: any,
  groupMessageData: GroupMessageInput
) => {
  switch (true) {
    case e.message.includes("failed to get the given group id"):
      dispatch(
        pushError(
          "TOAST",
          {},
          {
            id: "redux.err.group.send-group-message.1",
            value: {
              payload: isTextPayload(groupMessageData.payloadInput)
                ? groupMessageData.payloadInput.payload
                : groupMessageData.payloadInput.payload.metadata.fileName,
            },
          }
        )
      );
      break;
    case e.message.includes("failed to get the replied message from DHT"):
      dispatch(
        pushError("TOAST", {}, { id: "redux.err.group.send-group-message.2" })
      );
      break;
    default:
      break;
  }
};

export default sendGroupMessage;
