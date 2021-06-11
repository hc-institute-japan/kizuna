import { ToastOptions } from "@ionic/core";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { shiftError } from "../redux/error/actions";
import { RootState } from "../redux/types";
import { useAppDispatch } from "../utils/helpers";
import { useToast } from "./ToastContainer/context";

const ErrorHandler: React.FC = ({ children }) => {
  const errors = useSelector((state: RootState) => state.error.errors);
  const { showErrorToast } = useToast();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  useEffect(() => {
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
      console.log(intlMessage);
      showErrorToast({ ...(error.options as ToastOptions), ...intlMessage });
      dispatch(shiftError());
    }
  }, [errors]);
  return <>{children}</>;
};

export default ErrorHandler;
