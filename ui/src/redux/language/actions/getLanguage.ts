import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "../../types";
import setLanguage from "./setLanguage";

const getLanguage = (): any => {
  return function (
    dispatch: ThunkDispatch<RootState, any, AnyAction>,
    getState: () => RootState
  ) {
    let languageValue = null;

    const { language } = getState().language;

    if (!language) {
      const localLanguage = localStorage.getItem("language");

      if (localLanguage) {
        languageValue = localLanguage;
      } else languageValue = language;
    }
    if (languageValue) dispatch(setLanguage(languageValue));

    return languageValue;
  };
};

export default getLanguage;
