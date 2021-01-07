import { IonButtons, IonHeader, IonMenuButton, IonToolbar } from "@ionic/react";
import React from "react";

const Toolbar = () => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonMenuButton />
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

export default Toolbar;
