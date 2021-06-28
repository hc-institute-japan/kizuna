import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { AgentProfile, Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_BLOCKED } from "../types";

const fetchBlocked =
  (): ThunkAction =>
  async (dispatch, _, { callZome }) => {
    try {
      const ids = await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_BLOCKED,
      });

      let blocked: { [key: string]: Profile } = {};
      try {
        const profilesOutput = await callZome({
          zomeName: ZOMES.PROFILES,
          fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENTS_PROFILES,
          payload: ids,
        });
        console.log(ids);
        console.log(profilesOutput);
        profilesOutput.forEach((agentProfile: AgentProfile) => {
          const id = agentProfile.agent_pub_key;
          blocked[id] = {
            id,
            username: agentProfile.profile.nickname,
          };
        });
        dispatch({
          type: SET_BLOCKED,
          blocked,
        });
        return blocked;
      } catch (e) {
        if (e.message.includes("Failed to get the username for this agent"))
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.contacts.fetch-blocked.1" })
          );
        else if (e.message.includes("No username for this agent exists"))
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.contacts.fetch-blocked.2" })
          );
        else dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return null;
  };

export default fetchBlocked;
