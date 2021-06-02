import { createContext, useContext } from "react";
import { ErrorTypeProps, ErrorType } from "./types";

const ErrorContext = createContext({
  displayError: (errorType: ErrorType, errorTypeProps: ErrorTypeProps) => {},
});

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("Cannot get error context :(");
  return context;
};

export default ErrorContext;
