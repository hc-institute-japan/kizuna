import { ThunkAction } from "../../types";
import { getGifs } from "./utils";

export const searchTrending = (): ThunkAction => async (dispatch, getState) => {
  let currentState = { ...getState().p2pmessages };

  getGifs(undefined);

  return true;
};
