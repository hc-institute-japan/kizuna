import React from "react";
import { useToast } from "../ToastContainer/context";
import ErrorContext from "./context";
import { CallError } from "./types";

const ErrorContainer: React.FC = ({ children }) => {
  const { showToast } = useToast();
  const displayError: CallError = (errorType, errorTypeProps) => {
    if (errorType === "TOAST") {
      showToast({
        color: "danger",
        ...errorTypeProps,
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
