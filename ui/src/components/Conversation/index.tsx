import {
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
  IonLoading,
} from "@ionic/react";
import { peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { getAgentId } from "../../redux/profile/actions";

import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import { Message } from "../../utils/types";
import styles from "./style.module.css";

interface Props {
  isGroup: boolean;
  groupId?: string;
  content: { src: string; sender?: string; name: string; messages: Message[] };
  myAgentId: string;
}

const Conversation: React.FC<Props> = ({
  content,
  isGroup,
  groupId,
  myAgentId,
}) => {
  const intl = useIntl();
  const { src, name, messages } = content;
  const [badgeCount, setBadgeCount] = useState(0);

  const [latestMessageDetail, setLatestMessageDetail] = useState<{
    message: string;
    fileName?: string;
    sender?: Profile;
    payload: "TEXT" | "FILE";
  }>({
    message: "",
    fileName: "",
    payload: "TEXT",
  });
  const history = useHistory();
  const dispatch = useAppDispatch();

  const handleOnClick = () => {
    if (isGroup) {
      history.push(`/g/${groupId}`);
    } else { 
      history.push(`/u/${name}`);
    }
  };
  useSelector((state: RootState) => {
    if (groupId) {
      const group = state.groups.conversations[groupId];
      if (group) {
        const messages = group.messages
          .map((message) => state.groups.messages[message])
          .filter((message) => message !== undefined);
        dispatch(getAgentId()).then((id: any) => {
          if (id) setBadgeCount(messages.reduce((total) => total + 1, 0));
        });
      }
    }
  });

  useEffect(() => {
    setLatestMessageDetail(
      messages.length === 0
        ? {
            message: "",
            payload: "TEXT",
          }
        : messages.length === 1
        ? {
            message: messages[0].message,
            sender: messages[0].sender,
            fileName: messages[0].fileName ? messages[0].fileName : undefined,
            payload: messages[0].fileName ? "FILE" : "TEXT",
          }
        : {
            message: messages[messages.length - 1].message,
            sender: messages[messages.length - 1].sender,
            fileName: messages[messages.length - 1].fileName
              ? messages[messages.length - 1].fileName
              : undefined,
            payload: messages[messages.length - 1].fileName ? "FILE" : "TEXT",
          }
    );
    messages.sort((x: Message, y: Message) => {
      return x.timestamp[0] - y.timestamp[0];
    });
  }, [messages]);
  return (latestMessageDetail.sender || isGroup) ? (
    <IonItem onClick={handleOnClick}>
      <IonAvatar slot="start">
        <img
          className={styles.avatar}
          src={isGroup ? peopleCircleOutline : personCircleOutline}
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
            ? intl.formatMessage(
                { id: "app.conversation.me-file-string" },
                { fileName: latestMessageDetail.fileName! }
              )
            : intl.formatMessage(
                { id: "app.conversation.other-file-string" },
                {
                  fileName: latestMessageDetail.fileName!,
                  // this is non nullable since no file will be sent if there is no message sent
                  name: latestMessageDetail.sender!.username,
                }
              )}
        </p>
      </IonLabel>
      {badgeCount > 1 ? <IonBadge slot="">{badgeCount}</IonBadge> : null}
    </IonItem>
  ) : (
    <IonLoading isOpen={latestMessageDetail.sender ? false : true} />
  );
};

export default Conversation;
