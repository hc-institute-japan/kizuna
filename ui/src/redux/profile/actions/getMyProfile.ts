import { decode } from "@msgpack/msgpack";
import {
  binaryToUrl,
  getEntryFromRecord,
} from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, ProfileRaw, SET_PROFILE } from "../types";

const getMyProfile =
  (): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    console.log("calling get my profile");
    try {
      const res = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].GET_MY_PROFILE,
      });

      const myAgentIdB64 = getState().profile.id!; // find another source for this
      if (res) {
        const profileRaw = decode(getEntryFromRecord(res)) as ProfileRaw;
        dispatch<ProfileActionTypes>({
          type: SET_PROFILE,
          nickname: profileRaw.nickname,
          id: myAgentIdB64,
          fields: profileRaw.fields.avatar
            ? {
                avatar: binaryToUrl(profileRaw.fields.avatar),
              }
            : {},
        });
      }
      return true;
    } catch (e) {}
    return false;
  };

export default getMyProfile;
