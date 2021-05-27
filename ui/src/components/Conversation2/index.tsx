import { IonAvatar, IonBadge, IonItem, IonLabel } from "@ionic/react";
import { peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import {
  Conversation as ConversationDetail,
  Message,
} from "../../redux/commons/types";
import styles from "./style.module.css";

// export interface MessageDetail {
//   message: string;
//   fileName?: string;
//   sender: Profile;
//   payloadType: "TEXT" | "FILE";
// }

interface Props {
  type: "p2p" | "group";
  conversation: ConversationDetail;
  /* name for p2p is the sender's username, and for group it is the name of the group */
  myAgentId: string;
  onClick: () => void; // This onClick is for history.push(`/g/${groupId}`) | history.push(`/u/${name}`);
}

const Conversation: React.FC<Props> = ({
  type,
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
          /*
            TODO: add actual avatar of the conversation to the prop being passed
            to avoid this
          */
          src={type === "group" ? peopleCircleOutline : personCircleOutline}
          alt={`${conversation.conversationName}'s chat`}
        />
      </IonAvatar>
      <IonLabel>
        <h2>{conversation.conversationName}</h2>
        <h3>{conversation.latestMessage.sender.username}</h3>
        <p>
          {conversation.latestMessage.payloadType === "TEXT"
            ? conversation.latestMessage.textPayload
            : myAgentId === conversation.latestMessage.sender.id
            ? renderMyFileMessage(conversation.latestMessage)
            : renderOthersFileMessage(conversation.latestMessage)}
        </p>
      </IonLabel>
      {conversation.badgeCount > 20 ? (
        <IonBadge slot="">20+</IonBadge>
      ) : conversation.badgeCount > 0 ? (
        <IonBadge slot="">{conversation.badgeCount}</IonBadge>
      ) : null}
    </IonItem>
  );
};

export default Conversation;
