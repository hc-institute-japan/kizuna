import { serializeHash } from "@holochain-open-dev/core-types";
import { timestampToDate } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { APPEND_MESSAGE, P2PMessage, P2PMessageReceipt } from "../../types";

const receiveP2PMessage =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let receivedMessage = payload.message;
    console.log("signals", receivedMessage);

    const [messageTuple, receiptTuple] = receivedMessage;
    const [messageID, message] = messageTuple;
    const [receiptID, receipt] = receiptTuple!;

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

    let contacts = getState().contacts.contacts;

    let transformedReplyTo = undefined;
    if (message.replyTo !== null) {
      console.log(message.replyTo);
      transformedReplyTo = {
        p2pMessageEntryHash: serializeHash(message.replyTo.hash),
        author: contacts[serializeHash(message.replyTo.author)],
        receiver: serializeHash(message.replyTo.receiver),
        payload: message.replyTo.payload,
        timestamp: timestampToDate(message.replyTo.timeSent),
        receipts: [],
      };
    }

    let p2pMessage: P2PMessage = {
      p2pMessageEntryHash: serializeHash(messageID),
      author: contacts[serializeHash(message.author)],
      receiver: serializeHash(message.receiver),
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

    console.log("signals", p2pMessage, p2pReceipt);
    dispatch({
      type: APPEND_MESSAGE,
      state: {
        message: p2pMessage,
        receipt: p2pReceipt,
        key: p2pMessage.author.id,
      },
    });
  };

export default receiveP2PMessage;
