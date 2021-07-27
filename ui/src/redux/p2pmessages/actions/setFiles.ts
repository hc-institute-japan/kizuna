import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { SET_FILES } from "../types";

/* 
    set the FileBytes into the redux state
*/
export const setFiles =
  (filesToFetch: { [key: string]: Uint8Array }): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    const fetchedFiles = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
      payload: Object.keys(filesToFetch),
    });

    if (fetchedFiles?.type !== "error") {
      dispatch({
        type: SET_FILES,
        sate: fetchedFiles,
      });
      return true;
    }
  };
