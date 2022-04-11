import { deserializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_CONTACTS } from "../types";

const removeContact =
  (profile: Profile): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const contacts = getState().contacts.contacts;

    try {
      await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].REMOVE_CONTACTS,
        payload: [deserializeHash(profile.id)],
      });

      const {[profile.id]: _, ...newContacts} = contacts;
      dispatch({ type: SET_CONTACTS, contacts: newContacts });
      return true;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return false;
  };

export default removeContact;
