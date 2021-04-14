import { IonToast } from "@ionic/react";
import React from "react";

interface Props {
  toast: boolean;
  onDismiss(): any;
  message: string;
}

const RemoveMemberToast: React.FC<Props> = ({ toast, onDismiss, message }) => {
  return (
    <IonToast
      isOpen={toast}
      onDidDismiss={onDismiss}
      message={message}
      duration={1000}
      color="danger"
    />
  );
};

export default RemoveMemberToast;
