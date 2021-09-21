import {
  P2PMessageActionType,
  P2PMessageConversationState,
  SET_MESSAGES,
  SET_FILES,
  SET_PINNED,
  SET_TYPING,
  SET_RECEIPTS,
} from "./types";

const initialState: P2PMessageConversationState = {
  conversations: {},
  messages: {},
  receipts: {},
  files: {},
  typing: {},
  pinned: {},
};

// Hashes within the redux state are base64 strings with u prepended except for FileHash (except when used as key)
const reducer = (state = initialState, action: P2PMessageActionType) => {
  switch (action.type) {
    case SET_MESSAGES:
      return {
        ...state,
        conversations: action.state.conversations,
        messages: action.state.messages,
        receipts: action.state.receipts,
      };
    case SET_RECEIPTS:
      return {
        ...state,
        receipts: action.state,
      };
    case SET_FILES:
      return {
        ...state,
        files: action.state,
      };
    case SET_TYPING:
      return {
        ...state,
        typing: action.state,
      };
    case SET_PINNED:
      return {
        ...state,
        conversations: action.state.conversations,
        pinned: action.state.pinned,
      };
    // case PIN_MESSAGE:
    //   var stateToAppendPin = state;
    //   const pinConversant = action.state.conversant;

    //   for (const [key, value] of Object.entries(action.state.messages)) {
    //     const existing =
    //       stateToAppendPin.conversations[pinConversant] !== undefined;
    //     if (existing) {
    //       if (
    //         stateToAppendPin.conversations[pinConversant].pinned === undefined
    //       ) {
    //         stateToAppendPin.conversations[pinConversant].pinned = [key];
    //       } else if (
    //         !stateToAppendPin.conversations[pinConversant].pinned.includes(key)
    //       ) {
    //         stateToAppendPin.conversations[pinConversant].pinned.push(key);
    //       } else {
    //         continue;
    //       }
    //     }
    //     if (stateToAppendPin.pinned[key] === undefined) {
    //       stateToAppendPin.pinned[key] = value;
    //     } else continue;
    //   }

    //   return { ...stateToAppendPin };

    // case UNPIN_MESSAGE:
    //   const stateToRemovePin = state;
    //   const unpinConversant = action.state.conversant;

    //   Object.keys(action.state.messages).forEach((key) => {
    //     const existing =
    //       stateToRemovePin.conversations[unpinConversant] !== undefined;

    //     if (existing) {
    //       if (stateToRemovePin.conversations[unpinConversant].pinned === undefined) {
    //         stateToRemovePin.conversations[unpinConversant].pinned = [];
    //       } else if (stateToRemovePin.conversations[unpinConversant].pinned.includes(key)) {
    //         const index =
    //           stateToRemovePin.conversations[unpinConversant].pinned.indexOf(
    //             key
    //           );
    //         if (index > -1)
    //           stateToRemovePin.conversations[unpinConversant].pinned.splice(
    //             index,
    //             1
    //           );
    //       }

    //       if (stateToRemovePin.pinned[key]) {
    //         delete stateToRemovePin.pinned[key];
    //       }
    //     }
    //   });

    //   return { ...stateToRemovePin };

    default:
      return state;
  }
};

export default reducer;
