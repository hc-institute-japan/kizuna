import { ToastOptions } from "@ionic/core";

export type ErrorType = "TOAST";

export type ErrorTypeProps = ToastOptions;

export type CallError = (
  errorType: ErrorType,
  errorTypeProps: ErrorTypeProps,
  messageIntl?: { id: string; value: any }
) => any;
