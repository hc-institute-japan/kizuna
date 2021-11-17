import { ThunkAction } from "../../types";
import { SET_GIFS } from "../types";

export const setGifs =
  (fetchedGifs: any): ThunkAction =>
  async (dispatch, getState) => {
    //   let currentState = { ...getState().gif };

    dispatch({
      type: SET_GIFS,
      state: fetchedGifs.gifs,
    });

    return;
  };
