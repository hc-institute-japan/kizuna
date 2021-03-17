import { ToastOptions } from "@ionic/core";

export interface ToastContextType {
  showToast(options: ToastOptions): any;
  dismissToast(): any;
}
