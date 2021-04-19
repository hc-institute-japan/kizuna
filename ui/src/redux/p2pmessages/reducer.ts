import { actionSheetController } from "@ionic/core";
import {
  P2PMessageActionType,
  P2PMessageConversationState,
  P2PConversation,
  P2PMessage,
  P2PMessageReceipt,
  SET_MESSAGES,
  APPEND_MESSAGE
} from "./types";
import {
  FilePayload,
  MessageID
} from "../commons/types";
import { Uint8ArrayToBase64, timestampToDate } from "../../utils/helpers";
import { MessageFormatError } from "@formatjs/intl";
import { DefaultIonLifeCycleContext } from "@ionic/react";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
};

const reducer = (state = initialState, action: P2PMessageActionType) => {
  switch (action.type) {
    case SET_MESSAGES:
      console.log("Reducer setting messages");
      let { 0: p2pconversations, 1: p2pmessages, 2: p2preceipts } = Object.values(action.state);

      // check the state if conversation exists
      // true: append message ids to existing
      // false: append conversation
      var mergedConversations: { [key: string]: P2PConversation } = {};
      for (const [key, value] of Object.entries(p2pconversations)) {
        let messageIDs: MessageID[] = value as MessageID[];
        let conversation: P2PConversation = {
          messages: messageIDs
        };
        var existing = state.conversations[key];
        if (existing == undefined) mergedConversations[key] = conversation
        else mergedConversations[key] = {messages: [...new Set(existing.messages.concat(messageIDs))]}
      };

      // transform messages to fit the redux state
      var transformedMesssages: { [key: string]: P2PMessage } = {};
      for (const [key, value] of Object.entries(p2pmessages)) {
        let { 0: message, 1: receiptArray } = Object(value);
        // console.log("Reducer setting message", message);

        var payload;
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
              fileHash: Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
              thumbnail: message.payload.payload.fileType.type != "OTHER" 
                          ? message.payload.payload.fileType.payload.thumbnail
                          : null
            }
            break
          default:
            break
        }

        let p2pMessage = {
          p2pMessageEntryHash: key,
          author: message.author,
          payload: payload,
          timestamp: timestampToDate(message.timeSent),
          replyTo: message.replyTo,
          receipts: receiptArray
        }

        transformedMesssages[key] = p2pMessage
      }
      
      // transform receipts to fit redux state
      var transformedReceipts: { [key: string]: P2PMessageReceipt } = {};
      for (const [key, value] of Object.entries(p2preceipts)) {
        const { id, status: statusTuple } = Object(value);
        const { status, timestamp } = statusTuple;

        let p2preceipt = {
          p2pMessageReceiptEntryHash: key,
          p2pMessageEntryHashes: id,
          timestamp: timestampToDate(timestamp),
          status: status
        }

        transformedReceipts[key] = p2preceipt;
      }

      let ret: P2PMessageConversationState = {
        conversations: {
          ...mergedConversations
        },
        messages: {
          ...state.messages,
          ...transformedMesssages
        },
        receipts: {
          ...state.receipts,
          ...transformedReceipts
        }
      }

      console.log("Reducer finished setting messages", ret);
      return ret;
    case APPEND_MESSAGE:
      console.log("Reducer appending message", action.state);
      var ret2 = state;
      let { 0: message, 1: receiptTuple } = Object.values(action.state);
      let { 0: receiptID, 1: receipt } = receiptTuple;
      let { 0: currConversations, 1: currMessages, 2: currReceipts } = Object.values(state);
      
      let recipient = "u" + Uint8ArrayToBase64(message.receiver);
      let messageHash = "u" + Uint8ArrayToBase64(receipt.id);
      let receiptHash = "u" + Uint8ArrayToBase64(receiptID);
      let metadata = message.payload.metadata;

      var payload;
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
            fileHash: Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
            thumbnail: message.payload.payload.fileType.type != "OTHER" 
                        ? message.payload.payload.fileType.payload.thumbnail
                        : null
          }
          break
        default:
          break
      }

      let p2pMessage: P2PMessage = {
        p2pMessageEntryHash: Uint8ArrayToBase64(receipt.id),
        author: message.author,
        payload: payload,
        timestamp: timestampToDate(message.timeSent),
        replyTo: message.replyTo,
        receipts: [receiptHash]
      }

      let p2pReceipt: P2PMessageReceipt = {
        p2pMessageReceiptEntryHash: receiptID,
        p2pMessageEntryHashes: receipt.id,
        timestamp: timestampToDate(receipt.status.timestamp),
        status: receipt.status.status
      }

      var currConversationConversant = {};
      if (state.conversations[recipient] == undefined) {
        currConversationConversant = {
          ...currConversations,
          [recipient]: {messages: [messageHash]}
        }
      } else {
        currConversationConversant = {
          ...currConversations,
          [recipient]: {messages: [
            messageHash,
            ...state.conversations[recipient].messages
          ]}
        }
      }

      ret2 = {
        conversations: {
          ...currConversationConversant
        },
        messages: {
          ...currMessages,
          [messageHash]: p2pMessage
        },
        receipts: {
          ...currReceipts,
          [receiptHash]: p2pReceipt
        }
      }

      console.log("Reducer finished appening message", ret2);
      return ret2;
    default:
      return state;
  }
};

export default reducer;
