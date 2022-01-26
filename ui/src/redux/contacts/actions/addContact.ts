import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_CONTACTS } from "../types";

const addContact =
  (profile: Profile): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const contacts = getState().contacts.contacts;

    try {
      await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].ADD_CONTACTS,
        payload: [deserializeHash(profile.id)],
      });

      contacts[profile.id] = profile;
      dispatch({ type: SET_CONTACTS, contacts });
      return true;
    } catch (e) {
      if ((e as any).message.includes("agent already added"))
        dispatch(
          pushError(
            "TOAST",
            {},
            {
              id: "redux.err.contacts.add-contact.1",
              value: { username: profile.username },
            }
          )
        );
      else if ((e as any).message.includes("agent is blocked"))
        dispatch(
          pushError(
            "TOAST",
            {},
            {
              id: "redux.err.contacts.add-contact.2",
              value: { username: profile.username },
            }
          )
        );
    }
    return false;
  };

export default addContact;
