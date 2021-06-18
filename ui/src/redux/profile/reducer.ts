import { ProfileActionTypes, ProfileState, SET_USERNAME } from "./types";

const initialState: ProfileState = {
  id: null,
  username: null,
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.username,
        id: action.id,
      };

    default:
      return state;
  }
};

export default reducer;
