import { ThunkAction } from "../../types";
import { SET_GIFS } from "../types";

export const setGifs =
  (fetchedGifs: any): ThunkAction =>
  async (dispatch, getState) => {
    //   let currentState = { ...getState().gif };

    console.log("setGifs", fetchedGifs);
    dispatch({
      type: SET_GIFS,
      state: fetchedGifs,
    });

    return;
  };
