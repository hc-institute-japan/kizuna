import { IonIcon, IonItem, IonText } from "@ionic/react";
import {
  checkmarkDoneOutline,
  checkmarkOutline,
  personCircleOutline,
} from "ionicons/icons";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import { usePressHandlers } from "../../../utils/helpers";
import ChatModal from "../ChatModal";
import File from "../File";
import ReplyTo from "../ReplyTo";

import { default as common, default as styles } from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";

const Me: React.FC<ChatProps> = ({
  id,
  payload,
  author,
  timestamp,
  replyTo,
  onReply,
  type,
  showProfilePicture,
  isSeen = false,
  onDownload,
}) => {
  const onLongPress = () => setIsModalOpen(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const pressHandlers = usePressHandlers(onLongPress, () => {});
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";
  const intl = useIntl();

  return (
    <>
      <IonItem
        lines="none"
        className={`${common["me-container"]}`}
        {...pressHandlers}
      >
        <div
          className={`${common["me"]} ${common[isText ? "text" : "file"]} ${
            common.bubble
          }`}
        >
          {replyTo ? <ReplyTo message={replyTo}></ReplyTo> : null}
          {isText ? (
            <Text message={payload as TextPayload} />
          ) : (
            <File
              chatType={isP2P ? "p2p" : "group"}
              onDownload={onDownload}
              type="me"
              timestamp={timestamp}
              file={payload as FilePayload}
            />
          )}
          <IonText>
            <h6 className="ion-no-margin ion-text-end">
              {intl.formatTime(timestamp)}
              <IonIcon
                size="s"
                icon={isSeen ? checkmarkDoneOutline : checkmarkOutline}
              />
            </h6>
          </IonText>
        </div>
        {isP2P ? null : (
          <div className={common.picture} style={{ marginLeft: "0.5rem" }}>
            {showProfilePicture ? (
              <img
                className={styles.avatar}
                alt={`${author}'s profile`}
                src={personCircleOutline}
              />
            ) : null}
          </div>
        )}
      </IonItem>
      <ChatModal
        onReply={() => {
          if (onReply) onReply({ author, payload, id });
        }}
        open={[isModalOpen, setIsModalOpen]}
      ></ChatModal>
    </>
  );
};

export default Me;
