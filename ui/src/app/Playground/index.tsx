import { IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/react";
import React from "react";
import Chat from "../../components/Chat";

const Playground = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar></IonToolbar>
      </IonHeader>
      <IonContent>
        <Chat.ChatList></Chat.ChatList>
      </IonContent>
    </IonPage>
  );
};

export default Playground;
