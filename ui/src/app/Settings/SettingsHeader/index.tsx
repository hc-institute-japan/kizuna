import { IonBackButton, IonButtons, IonHeader, IonToolbar } from "@ionic/react";
import React from "react";

const SettingsHeader: React.FC = () => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonBackButton defaultHref="/" />
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

export default SettingsHeader;
