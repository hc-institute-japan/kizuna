import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/connection/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";

/* CURRENTLY UNUSED */
const fetchAllUsernames =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    try {
      const usernames = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].GET_ALL_USERNAMES,
      });

      const filteredProfiles = await Promise.all(
        usernames.map(async ({ username, agentId }: any) => ({
          id: serializeHash(agentId),
          username,
          isAdded: await callZome({
            zomeName: ZOMES.CONTACTS,
            fnName: FUNCTIONS[ZOMES.CONTACTS].IN_CONTACTS,
            payload: agentId,
          }),
        }))
      );

      return filteredProfiles.filter((profile: any) => !profile.isAdded);
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return null;
  };

export default fetchAllUsernames;
