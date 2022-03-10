import { ThunkAction } from "../../types";
import { SET_CATEGORIES } from "../types";

export const setCategories =
  (fetchedCategories: any): ThunkAction =>
  async (dispatch, getState) => {
    dispatch({
      type: SET_CATEGORIES,
      state: fetchedCategories,
    });

    return;
  };
