import {
  P2PMessageActionType,
  P2PMessageConversationState,
  SET_MESSAGES,
  APPEND_MESSAGE,
  APPEND_RECEIPT,
  SET_FILES,
  SET_TYPING
} from "./types";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
  files: {},
  typing: {}
};

// Hashes within the redux state are base64 strings with u prepended except for FileHash (except when used as key)
const reducer = (state = initialState, action: P2PMessageActionType) => {

  switch (action.type) {
    case SET_MESSAGES:
      // console.log("Reducer setting messages");

      // copy state
      let stateToSet = state;
      let { conversations, messages, receipts, files, typing } = action.state;

      // iterate through conversations
      for (const [key, value] of Object.entries(conversations)) {
        let existing = state.conversations[key];
        // if conversation is not yet existing, create new
        if (existing == undefined) stateToSet.conversations[key] = value
        // else simply append messages to the array value
        else stateToSet.conversations[key] = { messages: [...new Set(existing.messages.concat(value.messages))]}
      };
      
      // update copied state
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

      // console.log("Reducer finished setting messages", stateSet);
      return stateSet;

    case APPEND_MESSAGE:
      // console.log("Reducer appending message", action.state);

      // copy state
      var stateToAppendMessage = state; 

      // destructure inputs
      let key = action.state.key ? action.state.key : action.state.message.receiver;
      let messageHash = action.state.message.p2pMessageEntryHash;
      let receiptHash = action.state.receipt.p2pMessageReceiptEntryHash;

      // if conversation is not yet existing, create new
      if (stateToAppendMessage.conversations[key] == undefined) stateToAppendMessage.conversations[key]={messages: [messageHash]}
      // else simply append messages to the array value
      else stateToAppendMessage.conversations[key]={messages: [messageHash, ...stateToAppendMessage.conversations[key].messages]}
      
      // create a new file entry (allows duplicates)
      if (action.state.file != undefined) stateToAppendMessage.files[action.state.file.fileHash] = action.state.file.fileBytes;

      // update state
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

      // console.log("Reducer finished appending message", stateToAppendMessage);
      return stateToAppendMessage;

    case APPEND_RECEIPT:
      // console.log("Reducer appending receipt", action.state);

      // copy state
      var stateToAppendReceipt = state;

      // destructure inputs
      let receiptHashToAppend = action.state.p2pMessageReceiptEntryHash;
      let receiptToAppend = action.state;

      // iterate over the hashes in a receipt (single receipt can correspond to multiple messages)
      action.state.p2pMessageEntryHashes.forEach((hash) => {
        if (stateToAppendReceipt.messages[hash] != undefined) {
          stateToAppendReceipt.messages[hash].receipts.push(receiptHashToAppend)
        }
      })

      // update state
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
      // console.log("Reducer finished appending receipt", stateToAppendReceipt);
      return stateToAppendReceipt;

    case SET_FILES:
      // console.log("Reducer setting files")

      // copy state
      var ret4 = state;

      //update state
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
      var stateToAppendTyping = state;
      let id = action.state.profile.id;
      let profile = {
        id: id,
        username: action.state.profile.username
      };
      let status = action.state.isTyping;

      if (stateToAppendTyping.typing[id] == undefined && status) stateToAppendTyping.typing[id] = profile
      else {
        if (!status) delete stateToAppendTyping.typing[id]
      }

      stateToAppendTyping = {
        conversations: {
          ...stateToAppendTyping.conversations
        },
        messages: {
          ...stateToAppendTyping.messages
        },
        receipts: {
          ...stateToAppendTyping.receipts
        },
        files: {
          ...stateToAppendTyping.files
        },
        typing: {
          ...stateToAppendTyping.typing
        }
      }
      return stateToAppendTyping
    default:
      return state;
  }
};

export default reducer;
