import { convertCamelToSnake } from "../../utils/helpers";
import { ThunkAction } from "../types";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { PreferenceParameter, SET_PREFERENCE } from "./types";

export const fetchPreference = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {
  const preference = await callZome({
    zomeName: ZOMES.PREFERENCE,
    fnName: FUNCTIONS[ZOMES.PREFERENCE].GET_PREFERENCE,
  });
  dispatch({
    type: SET_PREFERENCE,
    preference: {
      readReceipt: preference.read_receipt,
      typingIndicator: preference.typing_indicator,
    },
  });
};

export const setPreference = (
  preference: PreferenceParameter
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  const keys = Object.keys(preference).map<any>((key) => ({
    [convertCamelToSnake(key)]: preference[key],
  }));

  const res = await callZome({
    zomeName: ZOMES.PREFERENCE,
    fnName: FUNCTIONS[ZOMES.PREFERENCE].SET_PREFERENCE,
    payload: Object.assign({}, ...keys),
  });

  dispatch({
    type: SET_PREFERENCE,
    preference: {
      readReceipt: res.read_receipt,
      typingIndicator: res.typing_indicator,
    },
  });
};
