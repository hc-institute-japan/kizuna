import { ProfileActionTypes, ProfileState } from "./types";

const initialState: ProfileState = {
  username: "seulgibear",
};

export default (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    default:
      return state;
  }
};
