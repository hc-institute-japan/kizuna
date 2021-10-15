import { createContext } from "react";
import { CallType, ModalProps } from "./types";

export const CallModalContext = createContext({
  show: (callback: (states: any) => CallType, props: ModalProps) => {},
  dismiss: () => {},
});
