import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_BLOCKED, SET_CONTACTS } from "../types";

const blockContact =
  (profile: Profile): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const { contacts, blocked } = getState().contacts;

    try {
      blocked[profile.id] = profile;
      await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].BLOCK_CONTACTS,
        payload: [deserializeHash(profile.id)],
      });
      delete contacts[profile.id];
      dispatch({ type: SET_BLOCKED, blocked });
      dispatch({ type: SET_CONTACTS, contacts });

      return true;
    } catch (e) {
      if ((e as any).message.includes("this agent is already blocked")) {
        dispatch(
          pushError(
            "TOAST",
            {},
            {
              id: "redux.err.contacts.block-contact.1",
              value: { username: profile.username },
            }
          )
        );
      }
    }
    return false;
  };

export default blockContact;
