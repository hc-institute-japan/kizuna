import { createContext, useContext } from "react";
import { CallError } from "./types";

const ErrorContext = createContext<{ displayError: CallError }>({
  displayError: (
    errorType,
    errorTypeProps,
    messageIntl?: {
      id: string;
      value: any;
    }
  ) => {},
});

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("Cannot get error context :(");
  return context;
};

export default ErrorContext;
