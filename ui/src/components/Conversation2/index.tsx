import { IonAvatar, IonBadge, IonItem, IonLabel } from "@ionic/react";
import { peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import { Profile } from "../../redux/profile/types";
import styles from "./style.module.css";

export interface MessageDetail {
  message: string;
  fileName?: string;
  sender: Profile;
  payload: "TEXT" | "FILE";
  badgeCount: number;
}

interface Props {
  type: "p2p" | "group";
  /* name for p2p is the sender's username, and for group it is the name of the group */
  conversationName: string;
  onClick: () => void; // This onClick is for history.push(`/g/${groupId}`) | history.push(`/u/${name}`);
  latestMessageDetail: MessageDetail;
  myAgentId: string;
  badgeCount: number;
}

const Conversation: React.FC<Props> = ({
  type,
  conversationName,
  myAgentId,
  onClick,
  badgeCount,
  latestMessageDetail,
}) => {
  const intl = useIntl();

  const renderMyFileMessage = (latestMessageDetail: MessageDetail) =>
    intl.formatMessage(
      { id: "components.conversation.me-file-string" },
      { fileName: latestMessageDetail.fileName! }
    );

  const renderOthersFileMessage = (latestMessageDetail: MessageDetail) =>
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
          alt={`${conversationName}'s chat`}
        />
      </IonAvatar>
      <IonLabel>
        <h2>{conversationName}</h2>
        <h3>{latestMessageDetail.sender.username}</h3>
        <p>
          {latestMessageDetail.payload === "TEXT"
            ? latestMessageDetail.message
            : myAgentId === latestMessageDetail.sender.id
            ? renderMyFileMessage(latestMessageDetail)
            : renderOthersFileMessage(latestMessageDetail)}
        </p>
      </IonLabel>
      {badgeCount > 20 ? (
        <IonBadge slot="">20+</IonBadge>
      ) : badgeCount > 0 ? (
        <IonBadge slot="">{badgeCount}</IonBadge>
      ) : null}
    </IonItem>
  );
};

export default Conversation;
