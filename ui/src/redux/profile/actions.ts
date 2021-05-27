import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { SET_USERNAME } from "./types";

export const setUsername =
  (username: string | null): ThunkAction =>
  (dispatch, _getState) =>
    dispatch({
      type: SET_USERNAME,
      username,
    });

export const fetchMyUsername =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
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

export const registerUsername =
  (username: string): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
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

export const fetchProfileFromUsername =
  (username: string): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    const res = await callZome({
      zomeName: ZOMES.USERNAME,
      fnName: FUNCTIONS[ZOMES.USERNAME].GET_AGENT_PUBKEY_FROM_USERNAME,
      payload: username,
    });

    if (res?.type !== "error") {
      return {
        id: serializeHash(res),
        username,
      };
    }
  };

export const getAgentId =
  (): ThunkAction =>
  async (_dispatch, _getState, { getAgentId }) =>
    await getAgentId();
