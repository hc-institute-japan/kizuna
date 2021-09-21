import {
  APPEND_MESSAGE,
  APPEND_RECEIPT,
  P2PMessageActionType,
  P2PMessageConversationState,
  PIN_MESSAGE,
  SET_ERR_MESSAGE,
  SET_FILES,
  SET_MESSAGES,
  SET_PINNED,
  SET_TYPING,
  UNPIN_MESSAGE,
} from "./types";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
  files: {},
  typing: {},
  pinned: {},
  errMsgs: {},
};

// Hashes within the redux state are base64 strings with u prepended except for FileHash (except when used as key)
const reducer = (state = initialState, action: P2PMessageActionType) => {
  switch (action.type) {
    case SET_MESSAGES:
      // console.log("Reducer setting messages");

      // copy state
      let stateToSet = { ...state };
      let { conversations, messages, receipts } = action.state;

      // iterate through conversations
      for (const [key, value] of Object.entries(conversations)) {
        let existing = state.conversations[key];
        // if conversation is not yet existing, create new
        if (existing === undefined) {
          stateToSet.conversations[key] = {
            messages: value.messages,
            pinned: [],
          };
        }
        // else simply append messages to the array value
        else
          stateToSet.conversations[key] = {
            messages: [...new Set(existing.messages.concat(value.messages))],
            pinned: [],
          };
      }

      // update copied state
      let stateSet: P2PMessageConversationState = {
        ...state,
        conversations: {
          ...state.conversations,
          ...stateToSet.conversations,
        },
        messages: {
          ...state.messages,
          ...messages,
        },
        receipts: {
          ...state.receipts,
          ...receipts,
        },
      };

      // console.log("Reducer finished setting messages", stateSet);
      return stateSet;

    case SET_ERR_MESSAGE:
      return { ...state, errMsgs: action.state.errMsgs };
    case APPEND_MESSAGE:
      // console.log("Reducer appending message", action.state);

      // copy state
      let stateToAppendMessage = state;

      // destructure inputs
      let key = action.state.key
        ? action.state.key
        : action.state.message.receiver.id;
      let messageHash = action.state.message.p2pMessageEntryHash;
      let receiptHash = action.state.receipt.p2pMessageReceiptEntryHash;

      // if conversation is not yet existing, create new
      if (stateToAppendMessage.conversations[key] === undefined)
        stateToAppendMessage.conversations[key] = {
          messages: [messageHash],
          pinned: [],
          // pinned: stateToAppendMessage.conversations[key].pinned
          //   ? [...stateToAppendMessage.conversations[key].pinned]
          //   : [],
        };
      // else simply append messages to the array value
      else
        stateToAppendMessage.conversations[key] = {
          pinned: [...stateToAppendMessage.conversations[key].pinned],
          messages: [
            messageHash,
            ...stateToAppendMessage.conversations[key].messages,
          ],
        };

      // create a new file entry (allows duplicates)
      if (action.state.file !== undefined)
        stateToAppendMessage.files[action.state.file.fileHash] =
          action.state.file.fileBytes;

      // update state
      stateToAppendMessage = {
        ...state,
        conversations: {
          ...stateToAppendMessage.conversations,
        },
        messages: {
          ...stateToAppendMessage.messages,
          [messageHash]: action.state.message,
        },
        receipts: {
          ...stateToAppendMessage.receipts,
          [receiptHash]: action.state.receipt,
        },
      };

      // console.log("Reducer finished appending message", stateToAppendMessage);
      return stateToAppendMessage;

    case APPEND_RECEIPT:
      // console.log("Reducer appending receipt", action.state);

      // copy state
      let stateToAppendReceipt = state;

      // destructure inputs
      let receiptHashToAppend = action.state.p2pMessageReceiptEntryHash;
      let receiptToAppend = action.state;

      // iterate over the hashes in a receipt (single receipt can correspond to multiple messages)
      action.state.p2pMessageEntryHashes.forEach((hash) => {
        if (stateToAppendReceipt.messages[hash] !== undefined) {
          stateToAppendReceipt.messages[hash].receipts.push(
            receiptHashToAppend
          );
        }
      });

      // update state
      stateToAppendReceipt = {
        ...state,
        conversations: {
          ...stateToAppendReceipt.conversations,
        },
        messages: {
          ...stateToAppendReceipt.messages,
        },
        receipts: {
          ...stateToAppendReceipt.receipts,
          [receiptHashToAppend]: receiptToAppend,
        },
      };
      // console.log("Reducer finished appending receipt", stateToAppendReceipt);
      return stateToAppendReceipt;

    case SET_FILES:
      // console.log("Reducer setting files")

      // copy state
      let stateToSetFiles = state;

      //update state
      stateToSetFiles = {
        ...state,
        conversations: {
          ...stateToSetFiles.conversations,
        },
        messages: {
          ...stateToSetFiles.messages,
        },
        receipts: {
          ...stateToSetFiles.receipts,
        },
        files: {
          ...stateToSetFiles.files,
          ...action.state,
        },
      };
      // console.log("reducer file set", stateToSetFiles);
      return stateToSetFiles;

    case SET_TYPING:
      let stateToAppendTyping = state;
      let id = action.state.profile.id;
      let profile = {
        id: id,
        username: action.state.profile.username,
      };
      let status = action.state.isTyping;

      if (stateToAppendTyping.typing[id] === undefined && status)
        stateToAppendTyping.typing[id] = profile;
      else {
        if (!status) delete stateToAppendTyping.typing[id];
      }

      stateToAppendTyping = {
        ...state,
        conversations: {
          ...stateToAppendTyping.conversations,
        },
        messages: {
          ...stateToAppendTyping.messages,
        },
        receipts: {
          ...stateToAppendTyping.receipts,
        },
        files: {
          ...stateToAppendTyping.files,
        },
        typing: {
          ...stateToAppendTyping.typing,
        },
        pinned: {
          ...stateToAppendTyping.pinned,
        },
      };
      return stateToAppendTyping;

    case SET_PINNED:
      let stateToSetPinned = state;
      const pinMessageConversant = action.state.conversant;

      if (stateToSetPinned.conversations[pinMessageConversant] === undefined) {
        // create new
        stateToSetPinned.conversations[pinMessageConversant] = {
          messages: [],
          pinned: [],
        };
        for (const [key, value] of Object.entries(action.state.messages)) {
          if (
            !stateToSetPinned.conversations[
              pinMessageConversant
            ].pinned.includes(key)
          ) {
            // console.log("red push 1");
            stateToSetPinned.conversations[pinMessageConversant].pinned.push(
              key
            );
          }
          if (stateToSetPinned.pinned[key] === undefined) {
            stateToSetPinned.pinned[key] = value;
          } else {
            continue;
          }
        }
      } else {
        // conversation existing but pinned is not
        if (
          stateToSetPinned.conversations[pinMessageConversant].pinned ===
          undefined
        ) {
          stateToSetPinned.conversations[pinMessageConversant].pinned = [];
          for (const [key, value] of Object.entries(action.state.messages)) {
            if (
              !stateToSetPinned.conversations[
                pinMessageConversant
              ].pinned.includes(key)
            ) {
              // console.log("red push 2");
              stateToSetPinned.conversations[pinMessageConversant].pinned.push(
                key
              );
            }
            if (stateToSetPinned.pinned[key] === undefined) {
              stateToSetPinned.pinned[key] = value;
            } else {
              continue;
            }
          }
        } else {
          for (const [key, value] of Object.entries(action.state.messages)) {
            if (
              !stateToSetPinned.conversations[
                pinMessageConversant
              ].pinned.includes(key)
            ) {
              // console.log("red push 3");
              stateToSetPinned.conversations[pinMessageConversant].pinned.push(
                key
              );
            }
            if (stateToSetPinned.pinned[key] === undefined) {
              stateToSetPinned.pinned[key] = value;
            } else {
              continue;
            }
          }
        }
      }

      return stateToSetPinned;

    case PIN_MESSAGE:
      let stateToAppendPin = state;
      const pinConversant = action.state.conversant;

      for (const [key, value] of Object.entries(action.state.messages)) {
        const existing =
          stateToAppendPin.conversations[pinConversant] !== undefined;
        if (existing) {
          if (
            stateToAppendPin.conversations[pinConversant].pinned === undefined
          ) {
            stateToAppendPin.conversations[pinConversant].pinned = [key];
          } else if (
            !stateToAppendPin.conversations[pinConversant].pinned.includes(key)
          ) {
            stateToAppendPin.conversations[pinConversant].pinned.push(key);
          } else {
            continue;
          }
        }
        if (stateToAppendPin.pinned[key] === undefined) {
          stateToAppendPin.pinned[key] = value;
        } else continue;
      }

      return { ...stateToAppendPin };

    case UNPIN_MESSAGE:
      const stateToRemovePin = state;
      const unpinConversant = action.state.conversant;

      Object.keys(action.state.messages).forEach((key) => {
        const existing =
          stateToRemovePin.conversations[unpinConversant] !== undefined;

        if (existing) {
          if (
            stateToRemovePin.conversations[unpinConversant].pinned === undefined
          ) {
            stateToRemovePin.conversations[unpinConversant].pinned = [];
          } else if (
            stateToRemovePin.conversations[unpinConversant].pinned.includes(key)
          ) {
            const index =
              stateToRemovePin.conversations[unpinConversant].pinned.indexOf(
                key
              );
            if (index > -1)
              stateToRemovePin.conversations[unpinConversant].pinned.splice(
                index,
                1
              );
          }

          if (stateToRemovePin.pinned[key]) {
            delete stateToRemovePin.pinned[key];
          }
        }
      });

      return { ...stateToRemovePin };

    default:
      return state;
  }
};

export default reducer;
