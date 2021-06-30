import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
import React from "react";

interface Props {
  onClick: () => void;
}

const AddContactFAB: React.FC<Props> = ({ onClick }) => (
  <IonFab vertical="bottom" horizontal="end" slot="fixed">
    <IonFabButton onClick={onClick}>
      <IonIcon icon={add} />
    </IonFabButton>
  </IonFab>
);

export default AddContactFAB;
