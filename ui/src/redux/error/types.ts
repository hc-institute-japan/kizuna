import { ToastOptions } from "@ionic/core";

export type ErrorType = "TOAST" | "test";

export type Error = ToastError;
export interface ErrorState {
  errors: Error[];
}

export type ErrorTypeProps = ToastOptions;

interface ToastError {
  type: "TOAST";
  options?: ToastOptions;
  intl?: { id: string; value: any };
}

export const PUSH_ERROR = "PUSH_ERROR";

export interface PushErrorAction {
  type: typeof PUSH_ERROR;
  error: Error;
}

export const SHIFT_ERROR = "SHIFT_ERROR";

export interface ShiftErrorAction {
  type: typeof SHIFT_ERROR;
  errors: Error[];
}

export type ErrorActionType = PushErrorAction | ShiftErrorAction;
