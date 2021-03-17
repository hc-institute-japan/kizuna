import { createContext, useContext } from "react";
import { ToastContextType } from "./types";

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  dismissToast: () => {},
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("Cannot get toast context :(");
  return context;
};
