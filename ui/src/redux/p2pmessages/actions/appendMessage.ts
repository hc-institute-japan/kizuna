import { ThunkAction } from "../../types";
import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../utils/helpers";
import { P2PMessage, P2PMessageReceipt, APPEND_MESSAGE } from "../types";

/*
    append a message, receipt, file bytes [no fetch] into the redux after a user sends a message
    append a message, receipt, file bytes [with fetch] into the redux after a receiver receives a signal
*/
export const appendMessage =
  (rawMessage: any, fileBytes?: any): ThunkAction =>
  async (dispatch, getState) => {
    console.log("appending message");
    const [messageTuple, receiptTuple] = rawMessage;
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

    const contactsState = { ...getState().contacts.contacts };
    const profile = { ...getState().profile };
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
      message.payload.type === "FILE"
        ? {
            fileHash: payload.fileHash,
            fileBytes: fileBytes,
          }
        : undefined;

    const state = {
      message: p2pMessage,
      receipt: p2pReceipt,
      file: p2pFile,
    };
    dispatch({
      type: APPEND_MESSAGE,
      state,
    });
    return true;
  };
