import { IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import {
  checkmarkDoneOutline,
  checkmarkOutline,
  personCircleOutline,
} from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import File from "../File";
import common from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";
import styles from "../style.module.css";

const Me: React.FC<ChatProps> = ({
  payload,
  author,
  timestamp,
  type,
  showProfilePicture,
  isSeen = false,
  onDownload,
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";
  const intl = useIntl();

  return (
    <IonItem lines="none" className={`${common["me-container"]}`}>
      <div
        className={`${common["me"]} ${common[isText ? "text" : "file"]} ${
          common.bubble
        }`}
      >
        {isText ? (
          <Text message={payload as TextPayload} />
        ) : (
          <File
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
  );
};

export default Me;
