import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { AgentProfile, Profile } from "../types";

const searchProfiles =
  (nicknamePrefix: string): ThunkAction =>
  async (_dispatch, getState, { callZome }) => {
    const state = getState();
    const contacts = state.contacts.contacts;
    const id = state.profile.id;
    try {
      const res: AgentProfile[] = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].SEARCH_PROFILES,
        payload: { nickname_prefix: nicknamePrefix },
      });
      /*
      filter the contacts that are already added
      and remove yourself from the searched result
      */
      console.log(res);
      const filteredMappedProfiles: Profile[] = res
        .filter(
          (res: AgentProfile) =>
            !Object.keys(contacts).includes(res.agent_pub_key) &&
            res.agent_pub_key !== id
        )
        .map((v: AgentProfile) => {
          return { id: v.agent_pub_key, username: v.profile.nickname };
        });
      return filteredMappedProfiles;
    } catch (e) {}
    return false;
  };

export default searchProfiles;
