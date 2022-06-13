import { serializeHash } from "@holochain-open-dev/core-types";
import { binaryToUrl } from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { ThunkAction } from "../../types";
import { ProfileActionTypes, SET_PROFILE } from "../types";

export const updateAvatar =
  (avatar: Uint8Array): ThunkAction =>
  async (dispatch, getState, { getAgentId, callZome }) => {
    // const myAgentId = await getAgentId();
    const myAgentIdB64 = getState().profile.id!;
    const { username, fields } = getState().profile;
    /* assume that getAgentId() is non-nullable */
    // const myAgentIdB64 = serializeHash(myAgentId!);
    const serializedAvatar = serializeHash(avatar);

    const updatedFields = { ...fields, avatar: serializedAvatar };

    await callZome({
      zomeName: ZOMES.PROFILES,
      fnName: FUNCTIONS[ZOMES.PROFILES].UPDATE_PROFILE,
      payload: {
        nickname: username,
        fields: updatedFields,
      },
    });

    dispatch<ProfileActionTypes>({
      type: SET_PROFILE,
      id: myAgentIdB64,
      /* assert that nickname is non-nullable */
      nickname: username!,
      fields: { ...updatedFields, avatar: binaryToUrl(serializedAvatar) },
    });
  };

export default updateAvatar;
