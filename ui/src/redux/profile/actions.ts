import { ThunkAction, AsyncThunkAction } from "../../utils/types";
import { SET_USERNAME } from "./types";

export const setUsername = (username: string | null): ThunkAction => (
  dispatch
) =>
  dispatch({
    type: SET_USERNAME,
    username,
  });

export const fetchMyUsername = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {
  const res = await callZome({
    zomeName: "username",
    fnName: "get_my_username",
  });

  if (res?.type !== "error") {
    dispatch({
      type: SET_USERNAME,
      username: res.username,
    });
  }
};
