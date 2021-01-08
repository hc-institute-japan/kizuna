import { IonAvatar, IonItem, IonLabel } from "@ionic/react";
import React from "react";
import { useHistory } from "react-router";
import { Message } from "../../utils/types";

interface Props {
  content: { src: string; sender?: string; name: string; messages: Message[] };
}

const Conversation: React.FC<Props> = ({ content }) => {
  const { src, name, sender, messages } = content;
  const history = useHistory();
  const handleOnClick = () => {
    history.push(`/u/${name}`, content);
  };
  return (
    <IonItem onClick={handleOnClick}>
      <IonAvatar slot="start">
        <img src={src} alt={`${name}'s chat`} />
      </IonAvatar>
      <IonLabel>
        <h2>{name}</h2>
        <h3>{sender}</h3>
        <p>{messages[0].message}</p>
      </IonLabel>
    </IonItem>
  );
};

export default Conversation;
