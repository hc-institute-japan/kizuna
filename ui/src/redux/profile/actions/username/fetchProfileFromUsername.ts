import { serializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../../utils/services/HolochainService/types";
import { pushError } from "../../../error/actions";
import { ThunkAction } from "../../../types";

const fetchProfileFromUsername =
  (username: string): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    try {
      const res = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].GET_AGENT_PUBKEY_FROM_USERNAME,
        payload: username,
      });

      if (res?.type !== "error") {
        return {
          id: serializeHash(res),
          username,
        };
      }
    } catch (e) {
      dispatch(
        pushError(
          "TOAST",
          {},
          { id: "redux.err.profile.fetch-profile-from-username.1" }
        )
      );
    }
  };
export default fetchProfileFromUsername;
