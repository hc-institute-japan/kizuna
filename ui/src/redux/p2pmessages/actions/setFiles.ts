import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../utils/HolochainService/types";
import { SET_FILES } from "../types";

/* 
    set the FileBytes into the redux state
*/
export const setFiles =
  (filesToFetch: { [key: string]: Uint8Array }): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const fetchedFiles = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
      payload: Object.keys(filesToFetch),
    });

    if (fetchedFiles?.type !== "error") {
      let currentState = { ...getState().p2pmessages.files };
      currentState = {
        ...currentState,
        ...fetchedFiles,
      };

      dispatch({
        type: SET_FILES,
        state: currentState,
      });

      return true;
    }
  };
