import {
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
  IonLoading,
} from "@ionic/react";
import { filter, peopleCircleOutline, personCircleOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { MessageFormatError, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { getAgentId } from "../../redux/profile/actions";

import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
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
      if (isGroup) {
        const group = state.groups.conversations[groupId];
        if (group) {
          dispatch(getAgentId()).then((id: any) => {
            const messagesReadList = group.messages.map(
              (message) => {
                if (state.groups.messages[message].author === Uint8ArrayToBase64(id)) {
                  return null
                } else {
                  return state.groups.messages[message].readList
                }
              }
            ).filter(value => value !== null);
            if (id) {
              // TODO: The slice() here is only a temporary method. 
              // We should fix the hc side so that we dont have to do something like this in the UI.
              let badgeCount = messagesReadList.filter(
                (messageReadList) => {
                  let maybeRead = Object.keys(messageReadList!).map((key: string) => {
                    key = key.slice(5)
                    return key;
                  }).filter((key: string) => key === Uint8ArrayToBase64(id).slice(4));
                  if (maybeRead.length === 0) {
                    return true
                  } else {
                    return false
                  }
                }
              ).length;
              setBadgeCount(badgeCount);
            }
          });
        }
      } else {
        const { conversations, messages, receipts } = state.p2pmessages;
        const conversation = conversations[groupId].messages;
        let unreadCounter = 0;
        conversation.map((messageID) => {
          let message = messages[messageID];
          let receiptIDs = message.receipts;
          let filteredReceipts = receiptIDs.map((receiptID) => {
            let receipt = receipts[receiptID];
            return receipt
          });
          filteredReceipts.sort((a: any, b: any) => {
            let receiptTimestampA = a.timestamp.getTime();
            let receiptTimestampB = b.timestamp.getTime();
            if (receiptTimestampA > receiptTimestampB) return -1;
            if (receiptTimestampA < receiptTimestampB) return 1;
            return 0;
          });
          let latestReceipt = filteredReceipts[0];
          if (latestReceipt.status !== "read" && message.author === groupId ) unreadCounter = unreadCounter + 1;
        });
        dispatch(getAgentId()).then((id: any) => {
          if (id) setBadgeCount(unreadCounter);
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
  return latestMessageDetail.sender || isGroup ? (
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
                { id: "components.conversation.me-file-string" },
                { fileName: latestMessageDetail.fileName! }
              )
            : intl.formatMessage(
                { id: "components.conversation.other-file-string" },
                {
                  fileName: latestMessageDetail.fileName!,
                  // this is non nullable since no file will be sent if there is no message sent
                  name: latestMessageDetail.sender!.username,
                }
              )}
        </p>
      </IonLabel>
      {badgeCount > 0 ? <IonBadge slot="">{badgeCount}</IonBadge> : null}
    </IonItem>
  ) : (
    <IonLoading isOpen={latestMessageDetail.sender ? false : true} />
  );
};

export default Conversation;
