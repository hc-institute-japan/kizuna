import { Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { SET_TYPING } from "../../types";

const typingP2P = (payload: any): ThunkAction => async (dispatch, getState) => {
  let contacts2 = getState().contacts.contacts;
  let agentHash = Uint8ArrayToBase64(payload.agent);
  let usernameTyping = contacts2[agentHash].username;
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
