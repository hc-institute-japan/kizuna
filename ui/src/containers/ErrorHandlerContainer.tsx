import { ToastOptions } from "@ionic/core";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { shiftError } from "../redux/error/actions";
import { RootState } from "../redux/types";
import { useAppDispatch } from "../utils/services/ReduxService";
import { useToast } from "./ToastContainer/context";

const ErrorHandler: React.FC = ({ children }) => {
  const errors = useSelector((state: RootState) => state.error.errors);
  const { showErrorToast } = useToast();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  useEffect(() => {
    console.log("calling ErrorHandler");
    if (errors.length > 0) {
      const error = errors[0];
      const intlMessage = error.intl
        ? {
            message: intl.formatMessage(
              { id: error.intl.id },
              error.intl.value
            ),
          }
        : {};

      showErrorToast({ ...(error.options as ToastOptions), ...intlMessage });
      dispatch(shiftError());
    }
  }, [errors, dispatch, intl, showErrorToast]);
  return <>{children}</>;
};

export default ErrorHandler;
