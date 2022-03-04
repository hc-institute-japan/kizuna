import { serializeHash } from "@holochain-open-dev/core-types";
import {
  P2PConversation,
  P2PMessage,
  P2PMessageConversationState,
  P2PMessageReceipt,
} from "../../types";
import { MessageID } from "../../../commons/types";
import { Profile } from "../../../profile/types";
import { timestampToDate } from "../../../../utils/services/DateService";

export const transformZomeDataToUIData = (
  zomeResults: P2PMessageConversationState,
  contacts: { [key: string]: Profile }
) => {
  // destructure zome hashmap results
  let {
    0: zomeConversations,
    1: zomeMessages,
    2: zomeReceipts,
  } = Object.values(zomeResults);

  // transform conversations
  let transformedConversations: { [key: string]: P2PConversation } = {};
  for (const [key, value] of Object.entries(zomeConversations)) {
    let messageIDs: MessageID[] = value as MessageID[];
    let conversation: P2PConversation = {
      messages: messageIDs,
      pinned: zomeConversations[key] ? zomeConversations[key].pinned : [],
    };
    transformedConversations[key] = conversation;
  }

  // transform messages
  let transformedMesssages: { [key: string]: P2PMessage } = {};
  for (const [key, value] of Object.entries(zomeMessages)) {
    let { 0: message, 1: receiptArray } = Object(value);
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

    let author = contacts[serializeHash(message.author)];

    let replyToPayload;
    let transformedReplyTo = undefined;
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
        author: contacts[serializeHash(message.replyTo.author)],
        receiver: contacts[serializeHash(message.replyTo.receiver)],
        payload: replyToPayload ? replyToPayload : message.replyTo.payload,
        timestamp: timestampToDate(message.replyTo.timeSent),
        replyTo: message.replyTo,
        receipts: message.replyTo.receipts,
      };
    }

    let p2pMessage: P2PMessage = {
      p2pMessageEntryHash: key,
      author: author,
      receiver: contacts[serializeHash(message.receiver)],
      payload: payload,
      timestamp: timestampToDate(message.timeSent),
      replyTo: transformedReplyTo ? transformedReplyTo : undefined,
      receipts: receiptArray,
    };

    transformedMesssages[key] = p2pMessage;
  }

  // transform receipts
  let transformedReceipts: { [key: string]: P2PMessageReceipt } = {};
  for (const [key, value] of Object.entries(zomeReceipts)) {
    const { id, status: statusTuple } = Object(value);
    const { status, timestamp } = statusTuple;

    let p2preceipt = {
      p2pMessageReceiptEntryHash: key,
      p2pMessageEntryHashes: id,
      timestamp: timestampToDate(timestamp),
      status: status,
    };

    transformedReceipts[key] = p2preceipt;
  }

  // consolidate transformed objects
  let consolidatedUIObject: P2PMessageConversationState = {
    conversations: transformedConversations,
    messages: transformedMesssages,
    receipts: transformedReceipts,
    files: {},
    typing: {},
    pinned: {},
    errMsgs: {},
  };

  return consolidatedUIObject;
};
