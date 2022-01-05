import { serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { P2PMessage, P2PMessageReceipt } from "../../types";
import { appendMessage } from "../../actions/appendMessage";

const receiveP2PMessage =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const receivedMessage = payload.message;

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

    const [messageTuple, receiptTuple] = receivedMessage;
    const [messageID, message] = messageTuple;
    const [receiptID, receipt] = receiptTuple!;

    // sender not in contacts
    if (!Object.keys(contactsState).includes(serializeHash(message.author))) {
      return;
    }

    let messagePayload;
    switch (message.payload.type) {
      case "TEXT":
        messagePayload = message.payload;
        break;
      case "FILE":
        messagePayload = {
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
      p2pMessageEntryHash: serializeHash(messageID),
      author: profileList[serializeHash(message.author)],
      receiver: profileList[serializeHash(message.receiver)],
      payload: messagePayload,
      timestamp: timestampToDate(message.timeSent),
      replyTo: transformedReplyTo ? transformedReplyTo : undefined,
      receipts: [serializeHash(receiptID)],
    };

    let p2pReceipt: P2PMessageReceipt = {
      p2pMessageReceiptEntryHash: serializeHash(receiptID),
      p2pMessageEntryHashes: [serializeHash(receipt.id[0])],
      timestamp: timestampToDate(receipt.status.timestamp),
      status: receipt.status.status,
    };

    dispatch(
      appendMessage({
        message: p2pMessage,
        receipt: p2pReceipt,
        key: p2pMessage.author.id,
      })
    );
  };

export default receiveP2PMessage;
