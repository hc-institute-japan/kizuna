import { ThunkAction } from "../../utils/types";
import { SET_USERNAME } from "./types";

export const setUsername = (username: string): ThunkAction => (dispatch) =>
  dispatch({
    type: SET_USERNAME,
    username,
  });
