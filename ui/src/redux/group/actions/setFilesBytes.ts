import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { SET_FILES_BYTES } from "../types";

export const fetchFilesBytes =
  (fileHashes: string[]): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    /* deserialize id for zome fn */
    const input = fileHashes.map((fileId: string) => deserializeHash(fileId));
    const res = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_FILES_BYTES,
      payload: input,
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
