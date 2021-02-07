import { SET_SIGNAL, SignalActionType } from "./types";

const initialState = {
  signal: [],
};

const reducer = (state = initialState, action: SignalActionType) => {
  switch (action.type) {
    case SET_SIGNAL:
      return {
        ...state,
        signal: [...state.signal, action.signal],
      };
    default:
      return state;
  }
};

export default reducer;
