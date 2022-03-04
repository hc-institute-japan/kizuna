import { FUNCTIONS, ZOMES } from "../../../utils/connection/types";
import { ThunkAction } from "../../types";
import { AgentProfile, Profile } from "../types";

const searchProfiles =
  (nicknamePrefix: string): ThunkAction =>
  async (_dispatch, getState, { callZome }) => {
    const state = getState();
    const contacts = { ...state.contacts.contacts };
    const id = state.profile.id;
    try {
      let res: AgentProfile[] = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].SEARCH_PROFILES,
        payload: { nicknamePrefix },
      });
      /*
      filter the contacts that are already added
      and remove yourself from the searched result as well as duplicates
      */
      // console.log("searched profiles", res);

      const filteredMappedProfiles: Profile[] = res
        .filter(
          (res: AgentProfile) =>
            !Object.keys(contacts).includes(res.agentPubKey) &&
            res.agentPubKey !== id
        )
        .map((v: AgentProfile) => {
          return {
            id: v.agentPubKey,
            username: v.profile.nickname,
            fields: v.profile.fields.avatar
              ? {
                  avatar: v.profile.fields.avatar,
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
