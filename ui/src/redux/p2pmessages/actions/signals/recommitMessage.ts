import { ThunkAction } from "../../../types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { pushError } from "../../../../redux/error/actions";
import { deserializeHash } from "@holochain-open-dev/core-types";

const recommitMessage =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let message = payload;

    try {
      await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].COMMIT_MESSAGE_TO_RECEIVER,
        payload: Buffer.from(deserializeHash(message.p2pMessageEntryHash)),
      });

      return true;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default recommitMessage;
