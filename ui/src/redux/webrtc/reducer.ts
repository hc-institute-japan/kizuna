import {
  SET_ANSWERS,
  SET_CALLS,
  SET_CANDIDATES,
  SET_CREATE_OFFER,
  SET_CREATE_PEER_CONNECTION,
  SET_OFFERS,
  WebRTCActions,
  WebRTCStateType,
} from "./types";

const initialState: WebRTCStateType = {
  offers: [],
  answers: [],
  candidates: [],
  calls: [],
  createPeerConnection: false,
  createOffer: [],
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
    case SET_CALLS:
      return {
        ...state,
        calls: action.calls,
      };
    case SET_CREATE_PEER_CONNECTION:
      return {
        ...state,
        createPeerConnection: action.createPeerConnection,
      };
    case SET_CREATE_OFFER:
      return {
        ...state,
        createOffer: action.createOffer,
      };
    default:
      return state;
  }
};
