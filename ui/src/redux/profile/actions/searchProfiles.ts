import {
  binaryToUrl,
  getEntryFromRecord,
} from "../../../utils/services/ConversionService";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { Profile, ProfileRaw } from "../types";
import { decode } from "@msgpack/msgpack";

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
        .map((rec: any) => {
          const raw = decode(getEntryFromRecord(rec)) as ProfileRaw;
          const profile = {
            id: serializeHash(rec.signed_action.Create.author),
            username: raw.nickname,
            fields: raw.fields.avatar ? { avatar: raw.fields.avatar } : {},
          };
          return profile;
        })
        .filter(
          (res: Profile) =>
            !Object.keys(contacts).includes(res.id) && res.id !== id
        );
      // console.log(filteredMappedProfiles);
      return filteredMappedProfiles;
    } catch (e) {}
    return false;
  };

export default searchProfiles;
