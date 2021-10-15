export const SET_OFFERS = "SET_OFFERS";
export const SET_ANSWERS = "SET_ANSWERS";
export const SET_CANDIDATES = "SET_CANDIDATES";
export const SET_CALLS = "SET_CALLS";
export const SET_CREATE_PEER_CONNECTION = "SET_CREATE_PEER_CONNECTION";
export const SET_CREATE_OFFER = "SET_CREATE_OFFER";

export interface SetOffers {
  type: typeof SET_OFFERS;
  offers: string[];
}

export interface SetAnswers {
  type: typeof SET_ANSWERS;
  answers: string[];
}

export interface SetCandidates {
  type: typeof SET_CANDIDATES;
  candidates: string[];
}

export interface SetCalls {
  type: typeof SET_CALLS;
  calls: Call[];
}

export interface SetCreatePeerConnection {
  type: typeof SET_CREATE_PEER_CONNECTION;
  createPeerConnection: boolean;
}

export interface SetCreateOffer {
  type: typeof SET_CREATE_OFFER;
  createOffer: string[];
}

export interface Call {
  name: string;
  id: string;
}

export interface WebRTCStateType {
  offers: string[];
  answers: string[];
  candidates: string[];
  calls: Call[];
  createPeerConnection: boolean;
  createOffer: string[];
}

export type WebRTCActions =
  | SetOffers
  | SetAnswers
  | SetCandidates
  | SetCalls
  | SetCreatePeerConnection
  | SetCreateOffer;
