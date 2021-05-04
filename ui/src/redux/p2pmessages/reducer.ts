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
import { bindActionCreators } from "redux";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
  files: {},
  typing: {}
};

// Hashes within the redux state are base64 strings with u prepended except FileHash
const reducer = (state = initialState, action: P2PMessageActionType) => {

  switch (action.type) {
    case SET_MESSAGES:
      console.log("Reducer setting messages");
      let stateToSet = state;
      let { conversations, messages, receipts, files, typing } = action.state;

      for (const [key, value] of Object.entries(conversations)) {
        let existing = state.conversations[key];
        if (existing == undefined) stateToSet.conversations[key] = value
        else stateToSet.conversations[key] = { messages: [...new Set(existing.messages.concat(value.messages))]}
      };

      let stateSet: P2PMessageConversationState = {
        conversations: {
          ...state.conversations,
          ...stateToSet.conversations
        },
        messages: {
          ...state.messages,
          ...messages
        },
        receipts: {
          ...state.receipts,
          ...receipts
        },
        files: {
          ...state.files,
        },
        typing: {
          ...state.typing
        }
      }

      console.log("Reducer finished setting messages", stateSet);
      return stateSet;

    case APPEND_MESSAGE:
      console.log("Reducer appending message", action.state);
      var stateToAppendMessage = state; 
      let key = action.state.key ? action.state.key : action.state.message.receiver;
      let messageHash = action.state.message.p2pMessageEntryHash;
      let receiptHash = action.state.receipt.p2pMessageReceiptEntryHash;

      if (stateToAppendMessage.conversations[key] == undefined) stateToAppendMessage.conversations[key]={messages: [messageHash]}
      else stateToAppendMessage.conversations[key]={messages: [messageHash, ...stateToAppendMessage.conversations[key].messages]}
      
      if (action.state.file != undefined) {
        // if (stateToAppendMessage.files[action.state.file.fileHash] == undefined) {
          stateToAppendMessage.files[action.state.file.fileHash] = action.state.file.fileBytes
        // }
      }

      stateToAppendMessage = {
        conversations: {
          ...stateToAppendMessage.conversations
        },
        messages: {
          ...stateToAppendMessage.messages,
          [messageHash]: action.state.message
        },
        receipts: {
          ...stateToAppendMessage.receipts,
          [receiptHash]: action.state.receipt
        },
        files: {
          ...stateToAppendMessage.files,
        },
        typing: {
          ...stateToAppendMessage.typing,
        }
      }

      console.log("Reducer finished appending message", stateToAppendMessage);
      return stateToAppendMessage;

    case APPEND_RECEIPT:
      console.log("Reducer appending receipt", action.state);
      var stateToAppendReceipt = state;
      let receiptHashToAppend = action.state.p2pMessageReceiptEntryHash;
      let receiptToAppend = action.state;

      action.state.p2pMessageEntryHashes.forEach((hash) => {
        if (stateToAppendReceipt.messages[hash] != undefined) {
          stateToAppendReceipt.messages[hash].receipts.push(receiptHashToAppend)
        }
      })

      stateToAppendReceipt = {
        conversations: {
          ...stateToAppendReceipt.conversations
        },
        messages: {
          ...stateToAppendReceipt.messages
        },
        receipts: {
          ...stateToAppendReceipt.receipts,
          [receiptHashToAppend]: receiptToAppend
        },
        files: {
          ...stateToAppendReceipt.files
        },
        typing: {
          ...stateToAppendReceipt.typing
        }
      }     
      console.log("Reducer finished appending receipt", stateToAppendReceipt);
      return stateToAppendReceipt;

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
          ...ret4.files,
          ...action.state,
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
