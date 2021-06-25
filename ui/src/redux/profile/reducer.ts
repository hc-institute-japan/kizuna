import {
  ProfileActionTypes,
  ProfileState,
  SET_USERNAME,
  SET_PROFILE,
} from "./types";

const initialState: ProfileState = {
  id: null,
  username: null, // TODO: change this to nickname in next clean up
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: action.username,
        id: action.id,
      };
    case SET_PROFILE:
      return {
        ...state,
        username: action.nickname,
        id: action.id,
      };

    default:
      return state;
  }
};

export default reducer;
