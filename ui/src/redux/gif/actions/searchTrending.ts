import { useSelector } from "react-redux";
import { RootState, ThunkAction } from "../../types";
import { getGifs } from "./utils";

export const searchTrending = (): ThunkAction => async (dispatch, getState) => {
  let gifs = dispatch(getGifs(undefined));
  console.log("searcha action", gifs);
  return gifs;
};
