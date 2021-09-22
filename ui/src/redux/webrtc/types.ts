export const SET_OFFERS = "SET_OFFERS";
export const SET_ANSWERS = "SET_ANSWERS";
export const SET_CANDIDATES = "SET_CANDIDATES";

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

export interface WebRTCStateType {
  offers: string[];
  answers: string[];
  candidates: string[];
}

export type WebRTCActions = SetOffers | SetAnswers | SetCandidates;
