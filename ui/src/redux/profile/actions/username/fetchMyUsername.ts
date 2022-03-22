import { serializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../../utils/services/HolochainService/types";
import { ThunkAction } from "../../../types";
import { SET_USERNAME } from "../../types";

/* CURRENTLY UNUSED */
const fetchMyUsername =
  (): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    try {
      const res = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].GET_MY_USERNAME,
      });
      // const myAgentId = await getAgentId();
      let myAgentId = getState().conductor.agentID;
      myAgentId = myAgentId !== null ? myAgentId : await getAgentId();
      /* assume that getAgentId() is non-nullable */
      const myAgentIdB64 = serializeHash(myAgentId!);
      if (res?.type !== "error") {
        dispatch({
          type: SET_USERNAME,
          username: res.username,
          id: myAgentIdB64,
        });
        return true;
      }
    } catch (e) {}
    return false;
  };

export default fetchMyUsername;
