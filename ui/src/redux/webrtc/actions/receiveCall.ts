import { AgentPubKey } from "@holochain/conductor-api";
import { ThunkAction } from "../../types";
import { SET_CALLS } from "../types";

interface Payload {
  name: string;
  id: AgentPubKey;
}

const receiveCall =
  (payload: string): ThunkAction =>
  (dispatch) => {
    const parsedPayload: Payload = JSON.parse(payload);
    console.log(parsedPayload);
    dispatch({
      type: SET_CALLS,
      calls: [parsedPayload],
    });
  };

export default receiveCall;
