import React from "react";
import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { pencil } from "ionicons/icons";

interface Props {
  onClickEdit: () => void;
  onClickNotif: () => void;
  disabled: boolean;
}

const EndButtons: React.FC<Props> = ({
  onClickEdit,
  onClickNotif,
  disabled,
}) => (
  <IonButtons slot="end">
    <>
      <IonButton onClick={onClickEdit} disabled={disabled ? true : false}>
        <IonIcon color="medium" icon={pencil} />
      </IonButton>
    </>
  </IonButtons>
);

export default EndButtons;
