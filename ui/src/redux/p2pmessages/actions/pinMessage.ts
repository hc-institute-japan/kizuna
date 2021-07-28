import { ThunkAction } from "../../types";
import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { P2PMessage, PIN_MESSAGE, UNPIN_MESSAGE } from "../types";

export const pinMessage =
  (messages: P2PMessage[]): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let now = Date.now();
    let seconds = (now / 1000) >> 0;
    let nanoseconds = (now % 1000) * 10 ** 6;
    let timestamp = [seconds, nanoseconds];

    let hashes: any = [];
    messages.map((message) =>
      hashes.push(deserializeHash(message.p2pMessageEntryHash))
    );

    let conversants = [
      Buffer.from(deserializeHash(messages[0].author.id)),
      Buffer.from(deserializeHash(messages[0].receiver.id)),
    ];

    let input = {
      message_hashes: hashes,
      conversants: conversants,
      timestamp: timestamp,
      status: "Pinned",
    };

    const pinnedMessages = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].PIN_MESSAGE,
      payload: input,
    });

    if (pinnedMessages?.type !== "error") {
      let pinHash = Object.keys(pinnedMessages)[0];
      const pin = pinnedMessages[pinHash];
      const pinStatus = pin.status;
      const messages = getState().p2pmessages.messages;

      let pinMessages: { [key: string]: P2PMessage } = {};
      pin.id.forEach((id: Uint8Array) => {
        const messageHash = serializeHash(id);
        const pinnedMessage = messages[messageHash];
        pinMessages[messageHash] = pinnedMessage;
      });

      let me = getState().profile.id;

      let conversant =
        me === pin.conversants[0]
          ? serializeHash(pin.conversants[1])
          : serializeHash(pin.conversants[0]);

      console.log("action pin message", pinnedMessages);
      if (pinStatus.pinstatus === "pinned") {
        dispatch({
          type: PIN_MESSAGE,
          state: { conversant: conversant, messages: pinMessages },
        });
      } else {
        dispatch({
          type: UNPIN_MESSAGE,
          state: { conversant: conversant, messages: pinMessages },
        });
      }

      return true;
    }

    return false;
  };
