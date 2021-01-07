import { ProfileActionTypes, ProfileState } from "./types";

const initialState: ProfileState = {
  username: "",
};

export default (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    default:
      return state;
  }
};
