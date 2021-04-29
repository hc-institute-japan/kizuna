import { ThunkAction } from "../types";
import { SET_LANGUAGE } from "./types";

export const setLanguage = (language: string): ThunkAction => {
  return function (dispatch) {
    dispatch({
      type: SET_LANGUAGE,
      language,
    });
  };
};
