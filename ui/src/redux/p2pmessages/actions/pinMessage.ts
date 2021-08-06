import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { dateToTimestamp } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { P2PMessage, PIN_MESSAGE, UNPIN_MESSAGE } from "../types";

export const pinMessage =
  (messages: P2PMessage[]): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const timestamp = dateToTimestamp(new Date());
    const pinned = getState().p2pmessages.pinned;

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
      status: pinned[messages[0].p2pMessageEntryHash] ? "Unpinned" : "Pinned",
    };
    try {
      const pinnedMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].PIN_MESSAGE,
        payload: input,
      });

      const pin: any = Object.values(pinnedMessages)[0];
      const pinStatus = pin.status;

      const messages = getState().p2pmessages.messages;

      const pinMessages: { [key: string]: P2PMessage } = {};
      pin.id.forEach((id: Uint8Array) => {
        const messageHash = serializeHash(id);
        const pinnedMessage = messages[messageHash];
        pinMessages[messageHash] = pinnedMessage;
      });

      const me = getState().profile.id;

      const conversant =
        me === pin.conversants[0]
          ? serializeHash(pin.conversants[0])
          : serializeHash(pin.conversants[1]);

      if (pinStatus.pinstatus === "pinned") {
        dispatch({
          type: PIN_MESSAGE,
          state: { conversant, messages: pinMessages },
        });
      } else {
        dispatch({
          type: UNPIN_MESSAGE,
          state: { conversant, messages: pinMessages },
        });
      }

      return true;
    } catch (e) {}
    return false;
  };
