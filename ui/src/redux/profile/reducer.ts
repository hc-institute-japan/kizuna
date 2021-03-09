import {
  ProfileActionTypes,
  ProfileState,
  SET_PROFILE,
  SET_USERNAME,
} from "./types";

const initialState: ProfileState = {
  username: null,
  id: null,
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.username,
      };
    case SET_PROFILE:
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
