import { ThunkAction } from "../../../types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { pushError } from "../../../../redux/error/actions";

const recommitMessage =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let message = payload;

    let input = {
      receiver: message.receiver,
      payload: message.payload,
      timestamp: message.time_sent,
      reply_to: message.replyTo ? message.reply_to : undefined,
    };

    try {
      let recommit = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].COMMIT_MESSAGE_TO_RECEIVER,
        payload: input,
      });

      if (recommit?.type !== "error") {
        dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
        return false;
      }

      return true;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default recommitMessage;
