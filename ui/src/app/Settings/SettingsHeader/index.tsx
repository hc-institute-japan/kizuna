import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";

const SettingsHeader: React.FC = () => {
  const history = useHistory();
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton
            onClick={() => history.push({ pathname: `/home` })}
            className="ion-no-padding"
          >
            <IonIcon slot="icon-only" icon={arrowBackSharp} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default SettingsHeader;
