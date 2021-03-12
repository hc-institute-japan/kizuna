import { ProfileActionTypes, ProfileState, SET_USERNAME } from "./types";

const initialState: ProfileState = {
  username: null,
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.username,
      };

    default:
      return state;
  }
};

export default reducer;
