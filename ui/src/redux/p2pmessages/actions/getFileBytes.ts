import { deserializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { HoloHashBase64, SET_FILES } from "../types";
import { pushError } from "../../../redux/error/actions";

// action to get the file bytes of a list of file addresses
export const getFileBytes =
  (inputHashes: HoloHashBase64[]): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    let hashes = inputHashes.map((hash) => deserializeHash(hash));
    try {
      const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_FILE_BYTES,
        payload: hashes,
      });

      let transformedFiles: { [key: string]: Uint8Array } = {};
      if (fetchedFiles?.type !== "error") {
        Object.keys(fetchedFiles).forEach((key) => {
          transformedFiles[key] = fetchedFiles[key];
        });
        if (Object.entries(transformedFiles).length > 0) {
          dispatch({
            type: SET_FILES,
            state: transformedFiles,
          });
        }
        return transformedFiles;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
