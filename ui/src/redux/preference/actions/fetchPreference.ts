import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { SET_PREFERENCE } from "../types";

export const fetchPreference =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    try {
      const preference = await callZome({
        zomeName: ZOMES.PREFERENCE,
        fnName: FUNCTIONS[ZOMES.PREFERENCE].GET_PREFERENCE,
      });
      dispatch({
        type: SET_PREFERENCE,
        preference: {
          readReceipt: preference.readReceipt,
          typingIndicator: preference.typingIndicator,
          agentReadReceipt: {},
          agentTypingIndicator: {},
          groupReadReceipt: {},
          groupTypingIndicator: {},
        },
      });
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
