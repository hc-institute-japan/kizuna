import { binaryToUrl } from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { Profile, ProfileRaw } from "../types";
import { decode } from "@msgpack/msgpack";
import { getEntryFromRecord } from "../../../utils/services/HolochainService";

const searchProfiles =
  (nicknamePrefix: string): ThunkAction =>
  async (_dispatch, getState, { callZome }) => {
    const state = getState();
    const contacts = { ...state.contacts.contacts };
    const id = state.profile.id;
    try {
      let res: [] = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].SEARCH_PROFILES,
        payload: { nickname_prefix: nicknamePrefix },
      });

      /*
       * filter the contacts that are already added
       * and remove yourself from the searched result as well as duplicates
       */

      const filteredMappedProfiles: Profile[] = res
        .map((v: any) => decode(getEntryFromRecord(res)) as ProfileRaw)
        .filter(
          (res: ProfileRaw) =>
            !Object.keys(contacts).includes(serializeHash(res.agentPubKey)) &&
            serializeHash(res.agentPubKey) !== id
        )
        .map((v: AgentProfile) => {
          return {
            id: serializeHash(v.agentPubKey),
            username: v.profile.nickname,
            fields: v.profile.fields.avatar
              ? {
                  avatar: binaryToUrl(v.profile.fields.avatar),
                }
              : {},
          };
        });
      // console.log(filteredMappedProfiles);
      return filteredMappedProfiles;
    } catch (e) {}
    return false;
  };

export default searchProfiles;
