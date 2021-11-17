import { ThunkAction } from "../../types";

export const getGifsState = (): ThunkAction => async (dispatch, getState) => {
  let state = { ...getState().gif.gifs };

  return state;
};
