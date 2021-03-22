import { IonAvatar, IonItem, IonLabel } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Message } from "../../utils/types";

interface Props {
  isGroup: boolean;
  groupId?: string;
  content: { src: string; sender?: string; name: string; messages: Message[] };
}

const Conversation: React.FC<Props> = ({ content, isGroup, groupId }) => {
  const { src, name, sender, messages } = content;
  const [latestMessage, setLatestMessage] = useState<string>("");
  const history = useHistory();
  const handleOnClick = () => {
    if (isGroup) {
      history.push(`/g/${groupId}`);
    } else { 
      history.push(`/u/${name}`, content);
    }
  };

  useEffect(() => {
    console.log(messages.length);
    setLatestMessage(messages.length === 0 ? "" : messages.length === 1 ? messages[0].message : messages[messages.length - 1].message);
    messages.sort((x: Message, y: Message) => {
      return x.timestamp.valueOf() - y.timestamp.valueOf();
    })
  }, [messages]);
  return (
    <IonItem onClick={handleOnClick}>
      <IonAvatar slot="start">
        <img src={src} alt={`${name}'s chat`} />
      </IonAvatar>
      <IonLabel>
        <h2>{name}</h2>
        <h3>{sender}</h3>
        <p>{latestMessage}</p>
      </IonLabel>
    </IonItem>
  );
};

export default Conversation;
