import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_CONTACTS } from "../types";

const fetchMyContacts =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    try {
      const ids = await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_ADDED,
      });

      let contacts: { [key: string]: Profile } = {};
      try {
        const usernameOutputs = await callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
          payload: ids,
        });
        usernameOutputs.forEach((usernameOutput: any) => {
          const base64 = serializeHash(usernameOutput.agentId);
          contacts[base64] = {
            id: base64,
            username: usernameOutput.username,
          };
        });
        dispatch({
          type: SET_CONTACTS,
          contacts,
        });
        return contacts;
      } catch (e) {
        dispatch(
          pushError(
            "TOAST",
            {},
            { id: "redux.err.contacts.fetch-my-contacts.1" }
          )
        );
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return null;
  };

export default fetchMyContacts;
