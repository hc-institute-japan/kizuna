import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../../types";
import { SET_TYPING } from "../../types";

const typingP2P =
  (payload: any): ThunkAction =>
  async (dispatch, getState) => {
    const contacts = getState().contacts.contacts;
    const agentHash = serializeHash(payload.agent);
    const isAdded: boolean = contacts[agentHash] ? true : false;
    /* 
      We ignore the signals coming from agents that are not part
      of the contacts list of the agent.
    */
    if (isAdded) {
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
    }
    return;
  };

export default typingP2P;
