import { useSelector } from "react-redux";
import { RootState, ThunkAction } from "../../types";
import { getGifs } from "./getGifs";

export const searchTrending = (): ThunkAction => async (dispatch, getState) => {
  let gifs = dispatch(getGifs(undefined));
  return gifs;
};