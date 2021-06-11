import { ErrorActionType, ErrorState, SHIFT_ERROR, PUSH_ERROR } from "./types";

const initialState: ErrorState = {
  errors: [],
};

const reducer = (state = initialState, action: ErrorActionType) => {
  switch (action.type) {
    case PUSH_ERROR:
      const curr = [...state.errors, action.error];
      return { ...state, errors: curr };
    case SHIFT_ERROR:
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

export default reducer;
