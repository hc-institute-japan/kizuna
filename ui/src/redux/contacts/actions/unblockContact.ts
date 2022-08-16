import { deserializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_BLOCKED } from "../types";

const unblockContact =
  (profile: Profile): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const blocked = getState().contacts.blocked;
    try {
      await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].UNBLOCK_CONTACTS,
        payload: [deserializeHash(profile.id)],
      });

      const { [profile.id]: _, ...newBlocked } = blocked;
      dispatch({ type: SET_BLOCKED, blocked: newBlocked });
      return true;
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return false;
  };

export default unblockContact;
