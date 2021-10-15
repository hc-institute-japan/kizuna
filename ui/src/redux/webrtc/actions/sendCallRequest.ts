import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, SIGNALS, ZOMES } from "../../../connection/types";
import { AgentPubKeyBase64 } from "../../p2pmessages/types";
import { ThunkAction } from "../../types";

const sendCallRequest =
  (agents: AgentPubKeyBase64[], me: string): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    // console.log(SIGNALS[ZOMES.WEBRTC].REQUESTING_CALL, agents);
    const dAgents = agents.map((agent) => deserializeHash(agent));
    const myAgentId = await getAgentId();

    await callZome({
      zomeName: ZOMES.WEBRTC,
      fnName: FUNCTIONS[ZOMES.WEBRTC].SIGNAL_RTC,
      payload: {
        name: SIGNALS[ZOMES.WEBRTC].REQUESTING_CALL,
        payload: JSON.stringify({
          id: myAgentId,
          name: me,
        }),
        agents: dAgents,
      },
    });
  };

export default sendCallRequest;
