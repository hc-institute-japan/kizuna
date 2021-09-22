import {
  SET_ANSWERS,
  SET_CANDIDATES,
  SET_OFFERS,
  WebRTCActions,
  WebRTCStateType,
} from "./types";

const initialState: WebRTCStateType = {
  offers: [],
  answers: [],
  candidates: [],
};

export default (state = initialState, action: WebRTCActions) => {
  switch (action.type) {
    case SET_OFFERS:
      return {
        ...state,
        offers: action.offers,
      };
    case SET_ANSWERS:
      return {
        ...state,
        answers: action.answers,
      };
    case SET_CANDIDATES:
      return {
        ...state,
        candidates: action.candidates,
      };
    default:
      return state;
  }
};
