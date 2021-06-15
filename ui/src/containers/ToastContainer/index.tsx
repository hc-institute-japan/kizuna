import { IonicSafeString, ToastOptions } from "@ionic/core";
import { IonToast } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { ToastContext } from "./context";

const ToastContainer: React.FC = ({ children }) => {
  const [isShowing, setIsShowing] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const language = useSelector((state: RootState) => state.language.language);
  const [props, setProps] = useState({});
  const showToast = (props: ToastOptions) => {
    setProps(props);
    setShouldShow(true);
  };

  useEffect(() => {
    setIsShowing(shouldShow);
  }, [shouldShow]);

  const dismissToast = () => {
    setShouldShow(false);
    setIsShowing(false);
  };

  useEffect(() => {
    if (!shouldShow) setProps({});
  }, [shouldShow]);

  function isString(string: any): string is string {
    return string.split !== undefined;
  }

  const showErrorToast = (props: ToastOptions) => {
    if (language === "en") {
      const message = props?.message;
      if (message) {
        const duration = isString(message)
          ? (message as string).split(" ").length * 160
          : (message as IonicSafeString).value.split(" ").length * 160;
        setProps({ color: "danger", duration, ...props });
      }
    } else if (language === "jp") {
      const message = props?.message;
      if (message) {
        const duration = isString(message)
          ? [...(message as string)].length * 100
          : [...(message as IonicSafeString).value].length * 100;
        setProps({ color: "danger", duration, ...props });
      }
    } else setProps({ color: "danger", ...props });
    setShouldShow(true);
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, showErrorToast }}>
      <IonToast
        isOpen={isShowing}
        onDidDismiss={dismissToast}
        duration={1500}
        {...props}
      />

      {children}
    </ToastContext.Provider>
  );
};

export default ToastContainer;
