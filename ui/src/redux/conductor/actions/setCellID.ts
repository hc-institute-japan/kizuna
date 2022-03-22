import { CellId } from "@holochain/client";
import { ThunkAction } from "../../types";
import { SET_CELL_ID } from "../types";

const setCellID =
  (cellID: CellId): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    dispatch({
      type: SET_CELL_ID,
      agentPubKey: cellID,
    });
    return true;
  };

export default setCellID;
