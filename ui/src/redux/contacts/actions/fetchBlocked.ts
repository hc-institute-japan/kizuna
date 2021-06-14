import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
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
        const usernameOutputs = await callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
          payload: ids,
        });
        usernameOutputs.forEach((usernameOutput: any) => {
          const base64 = serializeHash(usernameOutput.agentId);
          blocked[base64] = {
            id: base64,
            username: usernameOutput.username,
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
