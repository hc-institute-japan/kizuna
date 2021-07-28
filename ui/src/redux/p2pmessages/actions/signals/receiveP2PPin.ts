import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../../types";
import { PIN_MESSAGE, UNPIN_MESSAGE, P2PMessage } from "../../types";

const syncP2PPin =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let pinHash = Object.keys(payload.pin)[0];
    const pin = payload.pin[pinHash];
    const pinStatus = pin.status;
    const conversants = pin.conversants;
    const messages = getState().p2pmessages.messages;

    let pinMessages: { [key: string]: P2PMessage } = {};
    pin.id.forEach((id: Uint8Array) => {
      const messageHash = serializeHash(id);
      const pinnedMessage = messages[messageHash];
      pinMessages[messageHash] = pinnedMessage;
    });

    let me = getState().profile.id;

    if (pinStatus.pinstatus === "pinned") {
      dispatch({
        type: PIN_MESSAGE,
        state: {
          conversant:
            serializeHash(conversants[0]) === me
              ? serializeHash(conversants[1])
              : serializeHash(conversants[0]),
          messages: pinMessages,
        },
      });
    } else {
      dispatch({
        type: UNPIN_MESSAGE,
        state: {
          conversant:
            serializeHash(conversants[0]) === me
              ? serializeHash(conversants[1])
              : serializeHash(conversants[0]),
          messages: pinMessages,
        },
      });
    }
  };

export default syncP2PPin;
