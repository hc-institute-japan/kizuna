import { GifActionType, SET_GIFS } from "./types";

const initialState = {
  gifs: {},
};

const reducer = (state = initialState, action: GifActionType) => {
  switch (action.type) {
    case SET_GIFS:
      let currentState = state;
      currentState.gifs = action.state;
      return currentState;
    default:
      return state;
  }
};

export default reducer;
