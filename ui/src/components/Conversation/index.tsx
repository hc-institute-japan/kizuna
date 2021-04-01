import { IonAvatar, IonItem, IonLabel, IonLoading } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { Profile } from "../../redux/profile/types";
import { Message } from "../../utils/types";

interface Props {
  isGroup: boolean;
  groupId?: string;
  content: { src: string; sender?: string; name: string; messages: Message[] };
  myAgentId: string;
}

const Conversation: React.FC<Props> = ({ content, isGroup, groupId, myAgentId }) => {
  const intl = useIntl();
  const { src, name, messages } = content;
  const [latestMessageDetail, setLatestMessageDetail] = useState<{
    message: string,
    fileName?: string,
    sender?: Profile,
    payload:  "TEXT" | "FILE",
  }>({
    message: "",
    fileName: "",
    payload:  "TEXT",
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
    setLatestMessageDetail(messages.length === 0 ? {
      message: "",
      payload: "TEXT"
    } : messages.length === 1 ? {
      message: messages[0].message,
      sender: messages[0].sender,
      fileName: messages[0].fileName ? messages[0].fileName : undefined,
      payload: messages[0].fileName ? "FILE" : "TEXT",
    } : {
      message: messages[messages.length - 1].message,
      sender: messages[messages.length - 1].sender,
      fileName: messages[messages.length - 1].fileName ? messages[messages.length - 1].fileName : undefined,
      payload: messages[messages.length - 1].fileName ? "FILE" : "TEXT",
    });
    messages.sort((x: Message, y: Message) => {
      return x.timestamp[0] - y.timestamp[0];
    });
  }, [messages]);
  return (latestMessageDetail.sender) ? (
    <IonItem onClick={handleOnClick}>
      <IonAvatar slot="start">
        <img src={src} alt={`${name}'s chat`} />
      </IonAvatar>
      <IonLabel>
        <h2>{name}</h2>
        <h3>{latestMessageDetail.sender?.username}</h3>
        <p>{(latestMessageDetail.payload === "TEXT") ? 
        latestMessageDetail.message : 
        (myAgentId === latestMessageDetail.sender?.id) 
        ? intl.formatMessage({ id: "app.conversation.me-file-string"}, {fileName:  latestMessageDetail.fileName!}) 
        : intl.formatMessage({ id: "app.conversation.other-file-string" }, {fileName: latestMessageDetail.fileName!, name: latestMessageDetail.sender.username})}</p>
      </IonLabel>
    </IonItem>
  ) : <IonLoading isOpen={latestMessageDetail.sender ? false : true} />;
};

export default Conversation;
