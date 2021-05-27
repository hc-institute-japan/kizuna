import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
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

    let p2pMessage: P2PMessage = {
      p2pMessageEntryHash: serializeHash(messageID),
      author: serializeHash(message.author),
      receiver: serializeHash(message.receiver),
      payload: messagePayload,
      timestamp: timestampToDate(message.timeSent),
      replyTo: message.replyTo,
      receipts: [serializeHash(receiptID)],
    };

    let p2pReceipt: P2PMessageReceipt = {
      p2pMessageReceiptEntryHash: serializeHash(receiptID),
      p2pMessageEntryHashes: [serializeHash(receipt.id[0])],
      timestamp: timestampToDate(receipt.status.timestamp),
      status: receipt.status.status,
    };

    dispatch({
      type: APPEND_MESSAGE,
      state: {
        message: p2pMessage,
        receipt: p2pReceipt,
        key: p2pMessage.author,
      },
    });
  };

export default receiveP2PMessage;
