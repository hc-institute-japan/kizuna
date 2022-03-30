import { serializeHash } from "@holochain-open-dev/core-types";
import { binaryToUrl } from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
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
