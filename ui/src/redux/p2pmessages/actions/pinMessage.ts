import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { dateToTimestamp } from "../../../utils/services/DateService";

import { ThunkAction } from "../../types";
import { P2PMessage, SET_PINNED } from "../types";

export const pinMessage =
  (messages: P2PMessage[]): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const timestamp = dateToTimestamp(new Date());
    let currentState = { ...getState().p2pmessages };

    const hashes: Uint8Array[] = [];
    messages.map((message) =>
      hashes.push(deserializeHash(message.p2pMessageEntryHash))
    );

    const conversants = [
      Buffer.from(deserializeHash(messages[0].author.id)),
      Buffer.from(deserializeHash(messages[0].receiver.id)),
    ];

    const input = {
      message_hashes: hashes,
      conversants: conversants,
      timestamp: timestamp,
      status: currentState.pinned[messages[0].p2pMessageEntryHash]
        ? "Unpinned"
        : "Pinned",
    };

    try {
      const pinnedMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].PIN_MESSAGE,
        payload: input,
      });

      const pin: any = Object.values(pinnedMessages)[0];
      const pinStatus = pin.status.pinstatus;

      const conversant =
        getState().profile.id === serializeHash(pin.conversants[0])
          ? serializeHash(pin.conversants[1])
          : serializeHash(pin.conversants[0]);

      pin.id.forEach((id: Uint8Array) => {
        const messageHash = serializeHash(id);
        const pinnedMessage = currentState.messages[messageHash];
        const currentConversations = currentState.conversations;

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

      dispatch({
        type: SET_PINNED,
        state: currentState,
      });

      return true;
    } catch (e) {}
    return false;
  };
