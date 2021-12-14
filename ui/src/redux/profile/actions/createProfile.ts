import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_PROFILE } from "../types";

const createProfile =
  (nickname: string, image: string): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
    try {
      const myAgentId = await getAgentId();
      /* assume that getAgentId() is non-nullable */
      const myAgentIdB64 = serializeHash(myAgentId!);

      const avatarEntryHash = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].SET_AVATAR_BYTES,
        payload: image,
      });

      const res = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].CREATE_PROFILE,
        payload: {
          nickname,
          fields: {
            avatar: image,
          },
        },
      });
      dispatch<ProfileActionTypes>({
        type: SET_PROFILE,
        id: myAgentIdB64,
        nickname: res.profile.nickname,
        fields: {},
      });
      return res;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default createProfile;
