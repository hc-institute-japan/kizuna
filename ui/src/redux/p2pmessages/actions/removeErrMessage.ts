import { ThunkAction } from "../../types";
import { P2PMessage, SetErrMessageAction, SET_ERR_MESSAGE } from "../types";

// TODO: cache error messages
const removeErrMessage =
  (message: P2PMessage): ThunkAction =>
  async (dispatch, getState) => {
    if (message.err) {
      const { errMsgs } = getState().p2pmessages;
      let errMessages = errMsgs[message.receiver.id]
        ? errMsgs[message.receiver.id]
        : [];

      const stringified = errMessages.map((errMsg) => JSON.stringify(errMsg));
      const i = stringified.indexOf(JSON.stringify(message));
      if (i > -1) errMessages.splice(i, 1);
      dispatch<SetErrMessageAction>({
        type: SET_ERR_MESSAGE,
        state: {
          errMsgs: { ...errMsgs, [message.receiver.id]: errMessages },
        },
      });
    }
  };

export default removeErrMessage;
