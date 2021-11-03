import { GifActionType, SET_GIFS } from "./types";

const initialState = {
  gifs: {},
};

const reducer = (state = initialState, action: GifActionType) => {
  switch (action.type) {
    case SET_GIFS:
      return state;
    default:
      return state;
  }
};

export default reducer;
