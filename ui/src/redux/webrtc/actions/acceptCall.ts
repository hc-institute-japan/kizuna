import {
  AgentPubKeyB64,
  deserializeHash,
  serializeHash,
} from "@holochain-open-dev/core-types";
import { FUNCTIONS, SIGNALS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";

const acceptCall =
  (agents: AgentPubKeyB64[]): ThunkAction =>
  async (_dispatch, _getState, { callZome, getAgentId }) => {
    const dAgents = agents.map((agent) => deserializeHash(agent));
    const myId = await getAgentId();

    await callZome({
      zomeName: ZOMES.WEBRTC,
      fnName: FUNCTIONS[ZOMES.WEBRTC].SIGNAL_RTC,
      payload: {
        name: SIGNALS[ZOMES.WEBRTC].ACCEPTING_CALL,
        payload: JSON.stringify({ id: serializeHash(myId!) }),
        agents: dAgents,
      },
    });
  };

export default acceptCall;
