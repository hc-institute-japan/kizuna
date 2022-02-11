import { deserializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";

export const isTyping =
  (agent: string, isTyping: boolean): ThunkAction =>
  (dispatch, _getState, { callZome }) => {
    let payload = {
      agent: Buffer.from(deserializeHash(agent)),
      isTyping: isTyping,
    };

    callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].TYPING,
      payload: payload,
    });

    return null;
  };
