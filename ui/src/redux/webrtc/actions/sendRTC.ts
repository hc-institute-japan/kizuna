import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { AgentPubKeyBase64 } from "../../p2pmessages/types";
import { ThunkAction } from "../../types";

const sendRTC =
  (name: string, payload: string, agents: AgentPubKeyBase64[]): ThunkAction =>
  async (_dispatch, _getState, { callZome }) => {
    console.log(agents);
    callZome({
      zomeName: ZOMES.WEBRTC,
      fnName: FUNCTIONS[ZOMES.WEBRTC].SIGNAL_RTC,
      payload: { name, payload, agents },
    });
  };

export default sendRTC;
