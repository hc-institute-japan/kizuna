import { ThunkAction } from "../../types";
import { SET_ANSWERS } from "../types";

const receiveAnswer =
  (payload: string): ThunkAction =>
  (dispatch, getState) => {
    const { answers } = getState().webrtc;

    dispatch({
      type: SET_ANSWERS,
      answers: [...answers, payload],
    });
  };

export default receiveAnswer;
