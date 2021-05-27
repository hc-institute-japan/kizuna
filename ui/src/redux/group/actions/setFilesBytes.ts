import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { SET_FILES_BYTES } from "../types";

export const fetchFilesBytes =
  (fileHashes: Uint8Array[]): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const res = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_FILES_BYTES,
      payload: fileHashes,
    });

    if (res?.type !== "error") {
      const { groupFiles } = getState().groups;

      dispatch(
        setFilesBytes({
          ...groupFiles,
          ...res,
        })
      );
      return res;
    }
  };

export const setFilesBytes =
  (filesBytes: { [key: string]: Uint8Array }): ThunkAction =>
  async (dispatch, getState) => {
    const { groupFiles } = getState().groups;
    dispatch({
      type: SET_FILES_BYTES,
      filesBytes: {
        ...groupFiles,
        ...filesBytes,
      },
    });
  };
