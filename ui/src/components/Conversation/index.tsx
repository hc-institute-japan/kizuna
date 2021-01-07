import { IonAvatar, IonItem, IonLabel } from "@ionic/react";
import React from "react";

interface Props {
  src: string;
  sender?: string;
  name: string;
  message: string;
}

const Conversation: React.FC<Props> = ({ src, name, message, sender = "" }) => (
  <IonItem>
    <IonAvatar slot="start">
      <img src={src} alt={`${name}'s chat`} />
    </IonAvatar>
    <IonLabel>
      <h2>{name}</h2>
      <h3>{sender}</h3>
      <p>{message}</p>
    </IonLabel>
  </IonItem>
);

export default Conversation;
