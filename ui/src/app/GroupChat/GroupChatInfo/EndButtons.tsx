import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { pencil, notifications } from "ionicons/icons";
import React from "react";

interface Props {
  onClickEdit: () => void;
  onClickNotif: () => void;
}

const EndButtons: React.FC<Props> = ({onClickEdit, onClickNotif}) => (
  <IonButtons slot="end">
    <>
      <IonButton onClick={onClickEdit}>
        <IonIcon color="medium" icon={pencil} />
      </IonButton>
      <IonButton onClick={onClickNotif}>
        <IonIcon color="medium" icon={notifications} />
      </IonButton>
    </>
  </IonButtons>
);

export default EndButtons;
