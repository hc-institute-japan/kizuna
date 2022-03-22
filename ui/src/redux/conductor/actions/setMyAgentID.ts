import { AgentPubKey } from "@holochain/client";
import { ThunkAction } from "../../types";
import { SET_MY_AGENT_ID } from "../types";

const setMyAgentID =
  (agentID: AgentPubKey): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    dispatch({
      type: SET_MY_AGENT_ID,
      agentPubKey: agentID,
    });
    return true;
  };

export default setMyAgentID;
