import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_USERNAME } from "../types";

export const setUsername =
  (username: string | null): ThunkAction =>
  async (dispatch, _getState, { getAgentId }) => {
    const myAgentId = await getAgentId();
    /* assume that getAgentId() is non-nullable */
    const myAgentIdB64 = serializeHash(myAgentId!);

    dispatch<ProfileActionTypes>({
      type: SET_USERNAME,
      id: myAgentIdB64,
      /* assert that username is non-nullable */
      username: username!,
    });
  };

export default setUsername;
