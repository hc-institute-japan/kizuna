import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import {
  P2PMessage,
  P2PMessageReceipt,
} from "../../../redux/p2pmessages/types";
import { dateToTimestamp, timestampToDate } from "../../../utils/helpers";
import { FilePayloadInput, FileType, TextPayload } from "../../commons/types";
import { MessageInput } from "../types";
import { appendMessage } from "../actions/appendMessage";

/* SENDER */
/* 
    action to send a message
*/
export const sendMessageWithTimestamp =
  (
    receiver: string,
    message: string,
    type: string,
    timestamp: Date,
    replyTo?: string,
    file?: any
  ): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let payloadInput;
    if (type === "TEXT") {
      let textPayload: TextPayload = {
        type: "TEXT",
        payload: {
          payload: message.trim(),
        },
      };
      payloadInput = textPayload;
    } else {
      let fileType: FileType = {
        type: file.fileType.type,
        payload:
          file.fileType.type !== "OTHER"
            ? { thumbnail: file.fileType.payload.thumbnail }
            : null,
      };
      let filePayload: FilePayloadInput = {
        type: "FILE",
        payload: {
          metadata: file.metadata,
          fileType: fileType,
          fileBytes: file.fileBytes,
        },
      };
      payloadInput = filePayload;
    }

    // construct the message input structure
    let input = {
      receiver: Buffer.from(deserializeHash(receiver)),
      payload: payloadInput,
      timestamp: dateToTimestamp(timestamp),
      reply_to: replyTo ? Buffer.from(deserializeHash(replyTo)) : undefined,
    };

    // CALL ZOME
    try {
      const sentMessage = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE_WITH_TIMESTAMP,
        payload: input,
      });

      if (sentMessage?.type !== "error") {
        const [messageTuple, receiptTuple] = sentMessage;
        const [messageID, message] = messageTuple;
        const [receiptID, receipt] = receiptTuple!;

        let messageHash = serializeHash(messageID);
        let receiptHash = serializeHash(receiptID);

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
              fileHash: serializeHash(
                message.payload.payload.metadata.fileHash
              ),
              thumbnail:
                message.payload.payload.fileType.type !== "OTHER"
                  ? message.payload.payload.fileType.payload.thumbnail
                  : null,
            };
            break;
          default:
            break;
        }

        const contactsState = { ...getState().contacts.contacts };
        const profile = { ...getState().profile };
        const profileList = {
          ...contactsState,
          [profile.id!]: {
            id: profile.id!,
            username: profile.username!,
            fields: profile.fields,
          },
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

        let p2pMessage: P2PMessage = {
          p2pMessageEntryHash: messageHash,
          author: profileList[serializeHash(message.author)],
          receiver: profileList[serializeHash(message.receiver)],
          payload: payload,
          timestamp: timestampToDate(message.timeSent),
          replyTo: transformedReplyTo ? transformedReplyTo : undefined,
          receipts: [receiptHash],
        };

        let messageEntryHash = serializeHash(receipt.id[0]);
        let p2pReceipt: P2PMessageReceipt = {
          p2pMessageReceiptEntryHash: serializeHash(receiptID),
          p2pMessageEntryHashes: [messageEntryHash],
          timestamp: timestampToDate(receipt.status.timestamp),
          status: receipt.status.status,
        };

        let p2pFile =
          type === "FILE"
            ? {
                fileHash: payload.fileHash,
                fileBytes: file.fileBytes,
              }
            : undefined;

        // DISPATCH TO REDUCER
        dispatch(
          appendMessage({
            message: p2pMessage,
            receipt: p2pReceipt,
            file: p2pFile !== undefined ? p2pFile : undefined,
          })
        );
        return true;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
