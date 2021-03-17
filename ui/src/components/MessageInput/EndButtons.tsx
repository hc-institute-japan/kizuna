import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { camera, mic, send } from "ionicons/icons";
import React from "react";

interface Props {
  files: File[];
  message: string;
  onSend?(): any;
}

const EndButtons: React.FC<Props> = ({ message, files, onSend }) => (
  <IonButtons slot="end">
    {message.length > 0 ? null : (
      <>
        <IonButton>
          <IonIcon color="medium" icon={camera} />
        </IonButton>
        <IonButton>
          <IonIcon color="medium" icon={mic} />
        </IonButton>
      </>
    )}
    <IonButton
      onClick={onSend}
      disabled={message.length === 0 && files.length === 0}
    >
      <IonIcon color="medium" icon={send} />
    </IonButton>
  </IonButtons>
);

export default EndButtons;
