import { ThunkAction } from "../../types";
import { SET_OFFERS } from "../types";

const receiveOffer =
  (payload: string): ThunkAction =>
  (dispatch, getState) => {
    const { offers } = getState().webrtc;
    dispatch({ type: SET_OFFERS, offers: [...offers, payload] });
  };

export default receiveOffer;
