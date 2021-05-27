import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../../types";
import { SET_TYPING } from "../../types";

const typingP2P =
  (payload: any): ThunkAction =>
  async (dispatch, getState) => {
    let contacts = getState().contacts.contacts;
    let agentHash = serializeHash(payload.agent);
    let usernameTyping = contacts[agentHash].username;
    dispatch({
      type: SET_TYPING,
      state: {
        profile: {
          id: agentHash,
          username: usernameTyping,
        },
        isTyping: payload.is_typing,
      },
    });
  };

export default typingP2P;
