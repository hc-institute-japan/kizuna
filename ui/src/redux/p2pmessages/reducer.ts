import {
  P2PMessageActionType,
  P2PMessageConversationState,
  P2PConversation,
  P2PMessage,
  P2PMessageReceipt,
  SET_MESSAGES,
  APPEND_MESSAGE,
  APPEND_RECEIPT,
  SET_FILES,
  SET_TYPING
} from "./types";
import { MessageID } from "../commons/types";
import { Uint8ArrayToBase64, timestampToDate } from "../../utils/helpers";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
  files: {},
  typing: {}
};

const reducer = (state = initialState, action: P2PMessageActionType) => {

  
  switch (action.type) {
    case SET_MESSAGES:
      console.log("Reducer setting messages");
      let { 0: p2pconversations, 1: p2pmessages, 2: p2preceipts } = Object.values(action.state);

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

      var transformedMesssages: { [key: string]: P2PMessage } = {};
      for (const [key, value] of Object.entries(p2pmessages)) {
        let { 0: message, 1: receiptArray } = Object(value);
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
          author: Uint8ArrayToBase64(message.author),
          receiver: Uint8ArrayToBase64(message.receiver),
          payload: payload,
          timestamp: timestampToDate(message.timeSent),
          replyTo: message.replyTo,
          receipts: receiptArray
        }

        transformedMesssages[key] = p2pMessage
      }
      
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
        },
        files: {
          ...state.files,
        },
        typing: {
          ...state.typing
        }
      }

      console.log("Reducer finished setting messages", ret);
      return ret;
    case APPEND_MESSAGE:
      console.log("Reducer appending message", action.state);
      var ret2 = state;
      let { 0: currConversations, 1: currMessages, 2: currReceipts } = Object.values(state);
      
      let key = action.state.key ? action.state.key : action.state.message.receiver;
      let messageHash = action.state.message.p2pMessageEntryHash;
      let receiptHash = action.state.receipt.p2pMessageReceiptEntryHash;

      var currConversationConversant = {};
      if (state.conversations[key] == undefined) {
        currConversationConversant = {
          ...currConversations,
          [key]: {messages: [messageHash]}
        }
      } else {
        currConversationConversant = {
          ...currConversations,
          [key]: {messages: [
            messageHash,
            ...state.conversations[key].messages
          ]}
        }
      }

      ret2 = {
        conversations: {
          ...currConversationConversant
        },
        messages: {
          ...currMessages,
          [messageHash]: action.state.message
        },
        receipts: {
          ...currReceipts,
          [receiptHash]: action.state.receipt
        },
        files: {
          ...state.files
        },
        typing: {
          ...state.typing
        }
      }

      console.log("Reducer finished appening message", ret2);
      return ret2;
    case APPEND_RECEIPT:
      console.log("Reducer appending receipt", action.state);
      var ret3 = state;
      let receiptHashToAppend = action.state.p2pMessageReceiptEntryHash;
      let receiptToAppend = action.state;
      
      for (let hash in action.state.p2pMessageEntryHashes) {
        if (ret3.messages[hash]) {
          ret3.messages[hash].receipts.push(receiptHashToAppend)
        }
      }

      ret3 = {
        conversations: {
          ...ret3.conversations
        },
        messages: {
          ...ret3.messages
        },
        receipts: {
          ...ret3.receipts,
          [receiptHashToAppend]: receiptToAppend
        },
        files: {
          ...ret3.files
        },
        typing: {
          ...state.typing
        }
      }     
      console.log("Reducer finished appending receipt", ret3);
      return ret3;
    case SET_FILES:
      console.log("Reducer setting files")
      var ret4 = state;

      ret4 = {
        conversations: {
          ...ret4.conversations
        },
        messages: {
          ...ret4.messages
        },
        receipts: {
          ...ret4.receipts
        },
        files: {
          ...action.state
        },
        typing: {
          ...state.typing
        }
      }
      return ret4
    case SET_TYPING:
      console.log("Reducer setting typing profile")
      var ret5 = state;
      let id = action.state.profile.id;

      let currTyping = ret5.typing;
      if (currTyping[id]) {
        if (!action.state.isTyping) {
          delete currTyping[id]
        }
      } else {
        currTyping[id] = action.state.profile
      }

      ret5 = {
        conversations: {
          ...ret5.conversations
        },
        messages: {
          ...ret5.messages
        },
        receipts: {
          ...ret5.receipts
        },
        files: {
          ...ret5.files
        },
        typing: {
          ...currTyping
        }
      }

      return ret5
    default:
      return state;
  }
};

export default reducer;
