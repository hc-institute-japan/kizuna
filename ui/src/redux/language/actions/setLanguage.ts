import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "../../types";
import { SET_LANGUAGE } from "../types";

const setLanguage = (language: string): any => {
  return function (dispatch: ThunkDispatch<RootState, any, AnyAction>) {
    dispatch({
      type: SET_LANGUAGE,
      language,
    });
  };
};

export default setLanguage;
