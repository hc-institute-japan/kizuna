import { ThunkAction } from "../../utils/types";
import { FUNCTIONS, ZOMES } from "../holochain/types";
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
    zomeName: ZOMES.USERNAME,
    fnName: FUNCTIONS[ZOMES.USERNAME].GET_MY_USERNAME,
  });

  if (res?.type !== "error") {
    dispatch({
      type: SET_USERNAME,
      username: res.username,
    });
  }
};

export const registerUsername = (username: string): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {
  const res = await callZome({
    zomeName: ZOMES.USERNAME,
    fnName: FUNCTIONS[ZOMES.USERNAME].SET_USERNAME,
    payload: username,
  });

  if (res?.type !== "error") {
    dispatch({
      type: SET_USERNAME,
      username: res.username,
    });
    return res;
  }

  return null;
};
