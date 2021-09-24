import { ThunkAction } from "../../types";
import { SET_CANDIDATES } from "../types";

const receiveCandidate =
  (payload: string): ThunkAction =>
  (dispatch, getState) => {
    const { candidates } = getState().webrtc;

    dispatch({
      type: SET_CANDIDATES,
      candidates: [...candidates, payload],
    });
  };

export default receiveCandidate;
