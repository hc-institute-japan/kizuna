import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_PROFILE } from "../types";

export const setProfile =
  (nickname: string | null): ThunkAction =>
  async (dispatch, getState, { getAgentId }) => {
    // const myAgentId = await getAgentId();
    const myAgentIdB64 = getState().profile.id!;
    console.log("setProfile getState", getState().profile);
    console.log("setProfile", myAgentIdB64);
    /* assume that getAgentId() is non-nullable */
    // const myAgentIdB64 = serializeHash(myAgentId!);

    dispatch<ProfileActionTypes>({
      type: SET_PROFILE,
      id: myAgentIdB64,
      /* assert that nickname is non-nullable */
      nickname: nickname!,
      fields: {},
    });
  };

export default setProfile;
