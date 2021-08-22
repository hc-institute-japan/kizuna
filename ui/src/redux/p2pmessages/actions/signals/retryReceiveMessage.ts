import { ThunkAction } from "../../../types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";

const retryReceiveMessage =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let messageReceiveInput = payload.input;

    const zomeResponse = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].RETRY_RECEIVE_MESSAGE,
      payload: messageReceiveInput,
    });

    console.log("retry receive message action", zomeResponse);
  };

export default retryReceiveMessage;
