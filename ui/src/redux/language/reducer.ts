import { LanguageActionTypes, LanguageState, SET_LANGUAGE } from "./types";

const initialState: LanguageState = {
  language: null,
};

const reducer = (state = initialState, action: LanguageActionTypes) => {
  switch (action.type) {
    case SET_LANGUAGE:
      localStorage.setItem("language", action.language);
      return {
        ...state,
        language: action.language,
      };

    default:
      return state;
  }
};

export default reducer;
