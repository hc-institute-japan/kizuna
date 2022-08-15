import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../../types";

const syncP2PPin =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const pinHash = Object.keys(payload.pin)[0];
    const pin = payload.pin[pinHash];
    const pinStatus = pin.status.pinstatus;
    const conversant =
      getState().profile.id === serializeHash(pin.conversants[0])
        ? serializeHash(pin.conversants[1])
        : serializeHash(pin.conversants[0]);

    let currentState = { ...getState().p2pmessages };
    let currentConversations = currentState.conversations;

    pin.id.forEach((id: Uint8Array) => {
      const messageHash = serializeHash(id);
      const pinnedMessage = currentState.messages[messageHash];

      if (currentConversations[conversant]) {
        // initialize any undefined values
        if (!currentConversations[conversant].pinned)
          currentConversations[conversant].pinned = [];

        // pinned
        if (pinStatus === "pinned") {
          // push hash into conversations.pinned
          if (!currentConversations[conversant].pinned.includes(messageHash))
            currentConversations[conversant].pinned.push(messageHash);

          // push message into pinned
          if (!currentState.pinned[messageHash])
            currentState.pinned[messageHash] = pinnedMessage;
        }

        // unpinned
        if (pinStatus === "unpinned") {
          // remove hash from conversations.pinned
          if (currentConversations[conversant].pinned.includes(messageHash)) {
            const index =
              currentConversations[conversant].pinned.indexOf(messageHash);
            if (index > -1)
              currentConversations[conversant].pinned.splice(index, 1);
          }
          // remove hash from pinned
          if (currentState.pinned[messageHash]) {
            const { [messageHash]: _, ...newPinned } = currentState.pinned;
            currentState.pinned = { ...newPinned };
          }
        }
      }
    });
  };

export default syncP2PPin;
