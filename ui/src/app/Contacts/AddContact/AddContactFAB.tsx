import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
import React from "react";

interface Props {
  onClick: () => void;
}

const AddContactFAB: React.FC<Props> = ({ onClick }) => (
  <IonFab onClick={onClick} vertical="bottom" horizontal="end" slot="fixed">
    <IonFabButton>
      <IonIcon icon={add} />
    </IonFabButton>
  </IonFab>
);

export default AddContactFAB;
