import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { PreferenceParameter, SET_PREFERENCE } from "../types";

export const setPreference =
  (preference: PreferenceParameter): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    const keys = Object.keys(preference).map<any>((key) => ({
      [key]: preference[key],
    }));

    const res = await callZome({
      zomeName: ZOMES.PREFERENCE,
      fnName: FUNCTIONS[ZOMES.PREFERENCE].SET_PREFERENCE,
      payload: Object.assign({}, ...keys),
    });

    dispatch({
      type: SET_PREFERENCE,
      preference: {
        readReceipt: res.readReceipt,
        typingIndicator: res.typingIndicator,
      },
    });
  };
