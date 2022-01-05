import { IonAvatar, IonBadge, IonItem, IonLabel } from "@ionic/react";
import { peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import {
  Conversation as ConversationDetail,
  Message,
} from "../../redux/commons/types";
import AgentIdentifier from "../AgentIdentifier";
import styles from "./style.module.css";

interface Props {
  conversation: ConversationDetail;
  /* name for p2p is the sender's username, and for group it is the name of the group */
  myAgentId: string;
  onClick: () => void; // This onClick is for history.push(`/g/${groupId}`) | history.push(`/u/${name}`);
}

const Conversation: React.FC<Props> = ({
  conversation,
  myAgentId,
  onClick,
}) => {
  const intl = useIntl();

  const renderMyFileMessage = (latestMessageDetail: Message) =>
    intl.formatMessage(
      { id: "components.conversation.me-file-string" },
      { fileName: latestMessageDetail.fileName! }
    );

  const renderOthersFileMessage = (latestMessageDetail: Message) =>
    intl.formatMessage(
      { id: "components.conversation.other-file-string" },
      {
        fileName: latestMessageDetail.fileName!,
        /* this is non nullable since no file will be sent if there is no message sent */
        name: latestMessageDetail.sender!.username,
      }
    );

  return (
    <IonItem onClick={onClick}>
      <IonAvatar slot="start">
        <img
          className={styles.avatar}
          src={
            conversation.type === "group"
              ? peopleCircleOutline
              : conversation.avatar
              ? conversation.avatar
              : personCircleOutline
          }
          alt="avatar"
        />
      </IonAvatar>
      <IonLabel>
        {conversation.type === "group" ? (
          <h2>{conversation.conversationName}</h2>
        ) : (
          <div className={styles["identifier"]}>
            <AgentIdentifier
              noSpace={true}
              nickname={conversation.conversationName}
              id={conversation.id}
              charToShow={10}
            />
          </div>
        )}
        {conversation.latestMessage.sender ? (
          <h3>{conversation.latestMessage.sender.username}</h3>
        ) : null}
        <p>
          {conversation.latestMessage.payloadType === "TEXT"
            ? conversation.latestMessage.textPayload
            : myAgentId === conversation.latestMessage.sender!.id
            ? renderMyFileMessage(conversation.latestMessage)
            : renderOthersFileMessage(conversation.latestMessage)}
        </p>
      </IonLabel>
      {!conversation.badgeCount ? null : conversation.badgeCount > 20 ? (
        <IonBadge slot="">20+</IonBadge>
      ) : conversation.badgeCount > 0 ? (
        <IonBadge slot="">{conversation.badgeCount}</IonBadge>
      ) : null}
    </IonItem>
  );
};

export default Conversation;
