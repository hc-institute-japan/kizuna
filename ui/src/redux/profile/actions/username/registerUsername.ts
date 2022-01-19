import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { pushError } from "../../../error/actions";
import { ThunkAction } from "../../../types";
import { ProfileActionTypes, SET_USERNAME } from "../../types";

/* CURRENTLY UNUSED */
const registerUsername =
  (username: string): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
    try {
      const myAgentId = await getAgentId();
      /* assume that getAgentId() is non-nullable */
      const myAgentIdB64 = serializeHash(myAgentId!);

      const res = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].SET_USERNAME,
        payload: username,
      });
      dispatch<ProfileActionTypes>({
        type: SET_USERNAME,
        id: myAgentIdB64,
        username: res.username,
      });
      return res;
    } catch (e) {
      if ((e as any).message.includes("already taken"))
        dispatch(
          pushError("TOAST", {}, { id: "redux.err.profile.set-username.1" })
        );
      else if ((e as any).message.includes("already has a username"))
        dispatch(
          pushError("TOAST", {}, { id: "redux.err.profile.set-username.2" })
        );
      else dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default registerUsername;
