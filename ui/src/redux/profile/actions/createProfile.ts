import { serializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_PROFILE } from "../types";

const createProfile =
  (nickname: string, image: Uint8Array | null): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    try {
      // const myAgentId = await getAgentId();
      let myAgentId = getState().conductor.agentID;
      myAgentId = myAgentId !== null ? myAgentId : await getAgentId();

      /* assume that getAgentId() is non-nullable */
      const myAgentIdB64 = serializeHash(myAgentId!);

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
      dispatch<ProfileActionTypes>({
        type: SET_PROFILE,
        id: myAgentIdB64,
        nickname: res.profile.nickname,
        fields: image ? { avatar: serializeHash(image) } : {},
      });
      return res;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export default createProfile;
