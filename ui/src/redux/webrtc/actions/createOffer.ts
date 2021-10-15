import { ThunkAction } from "../../types";
import { SET_CREATE_OFFER } from "../types";

const createOffer =
  (payload: string): ThunkAction =>
  async (dispatch) => {
    const parsed = JSON.parse(payload);

    dispatch({
      type: SET_CREATE_OFFER,
      createOffer: [parsed.id],
    });
  };

export default createOffer;
