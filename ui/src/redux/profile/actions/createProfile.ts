import { serializeHash } from "@holochain-open-dev/core-types";
import { binaryToUrl } from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { getEntryFromRecord } from "../../../utils/services/HolochainService";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, ProfileRaw, SET_PROFILE } from "../types";
import { decode } from "@msgpack/msgpack";

const createProfile =
  (nickname: string, image: Uint8Array | null): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    try {
      // const myAgentId = await getAgentId();
      // /* assume that getAgentId() is non-nullable */
      // const myAgentIdB64 = serializeHash(myAgentId!);
      const myAgentIdB64 = getState().profile.id!;

      const payload = image
        ? {
            nickname,
            fields: {
              avatar: serializeHash(image),
            },
          }
        : { nickname, fields: {} };
      const res = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].CREATE_PROFILE,
        payload,
      });
      const profileRaw = decode(getEntryFromRecord(res)) as ProfileRaw;
      dispatch<ProfileActionTypes>({
        type: SET_PROFILE,
        id: myAgentIdB64,
        nickname: profileRaw.nickname,
        fields: image ? { avatar: binaryToUrl(serializeHash(image)) } : {},
      });
      return res;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default createProfile;
