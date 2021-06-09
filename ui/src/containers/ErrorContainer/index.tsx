import React from "react";
import { useIntl } from "react-intl";
import { useToast } from "../ToastContainer/context";
import ErrorContext from "./context";
import { CallError } from "./types";

const ErrorContainer: React.FC = ({ children }) => {
  const { showToast } = useToast();
  const intl = useIntl();
  const displayError: CallError = (errorType, errorTypeProps, messageIntl) => {
    const { id, value } = { ...messageIntl };
    if (errorType === "TOAST") {
      if (id)
        showToast({
          color: "danger",
          ...errorTypeProps,
          message: intl.formatMessage({ id: id }, value),
        });
    }
  };

  return (
    <ErrorContext.Provider value={{ displayError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContainer;
