import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { SET_FILES_BYTES } from "../types";

export const fetchFilesBytes =
  (fileHashes: string[]): ThunkAction =>
  async (dispatch, getState, { callZome, displayError }) => {
    /* deserialize id for zome fn */
    const input = fileHashes.map((fileId: string) => deserializeHash(fileId));

    try {
      const res = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].GET_FILES_BYTES,
        payload: input,
      });

      const { groupFiles } = getState().groups;

      dispatch(
        setFilesBytes({
          ...groupFiles,
          ...res,
        })
      );
      return res;
    } catch (e) {
      if (e.message.includes("The file bytes were not found")) {
        return displayError(
          "TOAST",
          {},
          { id: "redux.err.group.set-files-bytes.1" }
        );
      } else {
        return displayError("TOAST", {}, { id: "redux.err.generic" });
      }
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
