import { IonAvatar, IonBadge, IonItem, IonLabel } from "@ionic/react";
import { peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { Message } from "../../utils/types";
import styles from "./style.module.css";

export interface MessageDetail {
  message: string;
  fileName?: string;
  sender?: Profile;
  payload: "TEXT" | "FILE";
}

interface Props {
  type: "p2p" | "group";
  content: { src: string; sender?: string; name: string; messages: Message[] };
  onClick: () => void; // This onClick is for history.push(`/g/${groupId}`) | history.push(`/u/${name}`);
  latestMessageDetail: MessageDetail;
  myAgentId: string;
  badgeCount: number;
}

const Conversation: React.FC<Props> = ({
  type,
  content,
  myAgentId,
  onClick,
  badgeCount,
}) => {
  const intl = useIntl();
  const { src, name, messages } = content;

  const [latestMessageDetail, setLatestMessageDetail] = useState<MessageDetail>(
    {
      message: "",
      fileName: "",
      payload: "TEXT",
    }
  );

  // use useEffect and dispatch an action
  // useSelector((state: RootState) => {
  //   if (type === "group") {
  //   } else {
  //     const { conversations, messages, receipts } = state.p2pmessages;
  //     const conversation = conversations[groupId].messages;
  //     let unreadCounter = 0;
  //     conversation.map((messageID) => {
  //       let message = messages[messageID];
  //       let receiptIDs = message.receipts;
  //       let filteredReceipts = receiptIDs.map((receiptID) => {
  //         let receipt = receipts[receiptID];
  //         return receipt;
  //       });
  //       filteredReceipts.sort((a: any, b: any) => {
  //         let receiptTimestampA = a.timestamp.getTime();
  //         let receiptTimestampB = b.timestamp.getTime();
  //         if (receiptTimestampA > receiptTimestampB) return -1;
  //         if (receiptTimestampA < receiptTimestampB) return 1;
  //         return 0;
  //       });
  //       let latestReceipt = filteredReceipts[0];
  //       if (latestReceipt.status !== "read" && message.author === groupId)
  //         unreadCounter = unreadCounter + 1;
  //     });
  //     if (myAgentId) setBadgeCount(unreadCounter);
  //   }
  // });

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
          src={type === "group" ? peopleCircleOutline : personCircleOutline}
          alt={`${name}'s chat`}
        />
      </IonAvatar>
      <IonLabel>
        <h2>{name}</h2>
        <h3>{latestMessageDetail.sender?.username}</h3>
        <p>
          {latestMessageDetail.payload === "TEXT"
            ? latestMessageDetail.message
            : myAgentId === latestMessageDetail.sender?.id
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
