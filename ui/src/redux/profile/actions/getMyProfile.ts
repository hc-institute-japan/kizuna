import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { binaryToUrl } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_PROFILE } from "../types";

const getMyProfile =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
    try {
      const res = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].GET_MY_PROFILE,
      });
      console.warn("Agent's profile: ", res);
      const myAgentId = await getAgentId();
      /* assume that getAgentId() is non-nullable */
      const myAgentIdB64 = serializeHash(myAgentId!);

      if (res) {
        dispatch<ProfileActionTypes>({
          type: SET_PROFILE,
          nickname: res.profile.nickname,
          id: myAgentIdB64,
          fields: res.profile.fields.avatar
            ? {
                avatar: binaryToUrl(res.profile.fields.avatar),
              }
            : {},
        });
      }
      return true;
    } catch (e) {}
    return false;
  };

export default getMyProfile;
