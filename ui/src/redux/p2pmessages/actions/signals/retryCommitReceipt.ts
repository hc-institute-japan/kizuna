import { ThunkAction } from "../../../types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";

const retryCommitReceipt =
  (payload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let receipt = payload.receipt;

    const zomeResponse = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].RETRY_COMMIT_RECEIPT,
      payload: receipt,
    });

    console.log("retry commit receipt action", zomeResponse);
  };

export default retryCommitReceipt;
