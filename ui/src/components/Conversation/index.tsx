import { IonAvatar, IonItem, IonLabel } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Profile } from "../../redux/profile/types";
import { Message } from "../../utils/types";

interface Props {
  isGroup: boolean;
  groupId?: string;
  content: { src: string; sender?: string; name: string; messages: Message[] };
}

const Conversation: React.FC<Props> = ({ content, isGroup, groupId }) => {
  const { src, name, sender: messageSender, messages } = content;
  const [latestMessageDetail, setLatestMessageDetail] = useState<{
    message: string,
    sender: string
  }>({
    message: "",
    sender: ""
  });
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
    setLatestMessageDetail(messages.length === 0 ? {
      message: "",
      sender: ""
    } : messages.length === 1 ? {
      message: messages[0].message,
      sender: messages[0].sender.username
    } : {
      message: messages[messages.length - 1].message,
      sender: messages[messages.length - 1].sender.username
    });
    messages.sort((x: Message, y: Message) => {
      return x.timestamp.valueOf() - y.timestamp.valueOf();
    });
    console.log(latestMessageDetail);
  }, [messages]);
  return (
    <IonItem onClick={handleOnClick}>
      <IonAvatar slot="start">
        <img src={src} alt={`${name}'s chat`} />
      </IonAvatar>
      <IonLabel>
        <h2>{name}</h2>
        <h3>{latestMessageDetail.sender}</h3>
        <p>{latestMessageDetail.message}</p>
      </IonLabel>
    </IonItem>
  );
};

export default Conversation;
