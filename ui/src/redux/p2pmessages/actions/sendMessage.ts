import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FileContent } from "../../../components/MessageInput";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import {
  P2PMessage,
  P2PMessageReceipt,
} from "../../../redux/p2pmessages/types";
import { timestampToDate } from "../../../utils/helpers";
import {
  FilePayload,
  FilePayloadInput,
  FileType,
  TextPayload,
} from "../../commons/types";
import { ThunkAction } from "../../types";
import { appendMessage } from "../actions/appendMessage";
import { MessageInput } from "../types";

/* SENDER */
/* 
    action to send a message
*/

interface DispatchState {
  message: P2PMessage;
  receipt: P2PMessageReceipt | undefined;
  file: any;
}

const processSentData = (
  returnValue: any,
  contactsState: any,
  profile: any
) => {
  // const [messageTuple, receiptTuple] = returnValue;
  // const messageTuple = returnValue;
  const [messageID, message] = returnValue;
  // const [receiptID, receipt] = receiptTuple!;

  const messageHash = serializeHash(messageID);
  // const receiptHash = serializeHash(receiptID);

  let payload;
  switch (message.payload.type) {
    case "TEXT":
      payload = message.payload;
      break;
    case "FILE":
      payload = {
        type: "FILE",
        fileName: message.payload.payload.metadata.fileName,
        fileSize: message.payload.payload.metadata.fileSize,
        fileType: message.payload.payload.fileType.type,
        fileHash: serializeHash(message.payload.payload.metadata.fileHash),
        thumbnail:
          message.payload.payload.fileType.type !== "OTHER"
            ? message.payload.payload.fileType.payload.thumbnail
            : null,
      };
      break;
    default:
      break;
  }

  const profileList = {
    ...contactsState,
    [profile.id!]: { id: profile.id!, username: profile.username! },
  };

  let transformedReplyTo = undefined;
  let replyToPayload = undefined;
  if (message.replyTo !== null) {
    switch (message.replyTo.payload.type) {
      case "TEXT":
        replyToPayload = message.replyTo.payload;
        break;
      case "FILE":
        replyToPayload = {
          type: "FILE",
          fileName: message.replyTo.payload.payload.metadata.fileName,
          fileSize: message.replyTo.payload.payload.metadata.fileSize,
          fileType: message.replyTo.payload.payload.fileType.type,
          fileHash: serializeHash(
            message.replyTo.payload.payload.metadata.fileHash
          ),
          thumbnail:
            message.replyTo.payload.payload.fileType.type !== "OTHER"
              ? message.replyTo.payload.payload.fileType.payload.thumbnail
              : null,
        };
        break;
      default:
        break;
    }

    transformedReplyTo = {
      p2pMessageEntryHash: serializeHash(message.replyTo.hash),
      author: profileList[serializeHash(message.replyTo.author)],
      receiver: profileList[serializeHash(message.replyTo.receiver)],
      payload: replyToPayload ? replyToPayload : message.replyTo.payload,
      timestamp: timestampToDate(message.replyTo.timeSent),
      receipts: [],
    };
  }

  const p2pMessage: P2PMessage = {
    p2pMessageEntryHash: messageHash,
    author: profileList[serializeHash(message.author)],
    receiver: profileList[serializeHash(message.receiver)],
    payload: payload,
    timestamp: timestampToDate(message.timeSent),
    replyTo: transformedReplyTo ? transformedReplyTo : undefined,
    // receipts: [receiptHash],
    receipts: [],
  };

  // const messageEntryHash = serializeHash(receipt.id[0]);
  // const p2pReceipt: P2PMessageReceipt = {
  //   p2pMessageReceiptEntryHash: serializeHash(receiptID),
  //   p2pMessageEntryHashes: [messageEntryHash],
  //   timestamp: timestampToDate(receipt.status.timestamp),
  //   status: receipt.status.status,
  // };

  return {
    message: p2pMessage,
    // receipt: p2pReceipt,
    receipt: undefined,
    file: undefined,
  };
};

export const sendMessage =
  (
    receiver: string,
    message: string,
    type: string,
    replyTo?: string,
    file?: FileContent
  ): ThunkAction =>
  async (dispatch, getState, { callZome, retry }) => {
    let payloadInput;
    if (type === "TEXT") {
      const textPayload: TextPayload = {
        type: "TEXT",
        payload: {
          payload: message.trim(),
        },
      };
      payloadInput = textPayload;
    } else {
      const fileType: FileType = {
        type: file!.fileType.type,
        payload:
          file!.fileType.type !== "OTHER"
            ? { thumbnail: file!.fileType.payload!.thumbnail }
            : null,
      };
      const filePayload: FilePayloadInput = {
        type: "FILE",
        payload: {
          metadata: file!.metadata,
          fileType: fileType,
          fileBytes: file!.fileBytes,
        },
      };
      payloadInput = filePayload;
    }

    // construct the message input structure
    const input: MessageInput = {
      receiver: Buffer.from(deserializeHash(receiver)),
      payload: payloadInput,
      reply_to: replyTo ? Buffer.from(deserializeHash(replyTo)) : undefined,
    };

    // CALL ZOME
    try {
      const sentMessage = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input,
      });

      if (sentMessage?.type !== "error") {
        const contactsState = { ...getState().contacts.contacts };
        const profile = { ...getState().profile };

        const dispatchState: DispatchState = processSentData(
          sentMessage,
          contactsState,
          profile
        );

        const p2pFile =
          type === "FILE"
            ? {
                fileHash: (dispatchState.message.payload as FilePayload)
                  .fileHash,
                fileBytes: file!.fileBytes,
              }
            : undefined;

        dispatchState.file = p2pFile;

        // DISPATCH TO REDUCER
        dispatch(appendMessage(dispatchState));
        return true;
      }
    } catch (e) {
      try {
        if (!(e as any).message.includes("Timed out")) {
          const retriedSend = await retry({
            zomeName: ZOMES.P2PMESSAGE,
            fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
            payload: input,
          });

          if (retriedSend?.type !== "error") {
            const contactsState = { ...getState().contacts.contacts };
            const profile = { ...getState().profile };

            const dispatchState: DispatchState = processSentData(
              retriedSend,
              contactsState,
              profile
            );

            const p2pFile =
              type === "FILE"
                ? {
                    fileHash: (dispatchState.message.payload as FilePayload)
                      .fileHash,
                    fileBytes: file!.fileBytes,
                  }
                : undefined;

            dispatchState.file = p2pFile;
            dispatch(appendMessage(dispatchState));
            return true;
          }
        }
        return false;
      } catch (e) {
        // console.log("sending automatically retried message has failed", e);
        return false;
      }
    }
  };
