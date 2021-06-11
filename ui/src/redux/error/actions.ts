import { ThunkAction } from "../types";
import { ErrorType, ErrorTypeProps, SHIFT_ERROR, PUSH_ERROR } from "./types";

export const pushError =
  (
    errorType: ErrorType,
    errorTypeProps: ErrorTypeProps,
    intl?: { id: string; value?: any }
  ): ThunkAction =>
  (dispatch) => {
    if (errorType === "TOAST") {
      dispatch({
        type: PUSH_ERROR,
        error: {
          type: "TOAST",
          options: errorTypeProps,
          intl,
        },
      });
    }
  };

export const shiftError = (): ThunkAction => (dispatch, getState) => {
  const errors = [...getState().error.errors];

  if (errors.length > 0) {
    errors.shift();
    dispatch({ type: SHIFT_ERROR, errors });
  }
};
