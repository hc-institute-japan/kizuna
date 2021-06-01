import { IonItem, IonText } from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import React from "react";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import File from "../File";
import MessageTimestamp from "../MessageTimestamp";
import { default as common, default as styles } from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";

const Others: React.FC<ChatProps> = ({
  id,
  author,
  type,
  timestamp,
  payload,
  readList,
  onSeen,
  showProfilePicture,
  showName,
  isSeen = false,
  onDownload,
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";

  return (
    <>
      {isP2P ? null : showName ? (
        <IonItem lines="none" className={`${common["author-name"]}`}>
          <IonText color="medium">{author}</IonText>
        </IonItem>
      ) : null}

      <IonItem lines="none" className={`${common["others-container"]}`}>
        {isP2P ? null : (
          <div className={common.picture} style={{ marginRight: "0.5rem" }}>
            {showProfilePicture ? (
              <img
                className={styles.avatar}
                src={`${personCircleOutline}`}
                alt={`${author}'s profile`}
              />
            ) : null}
          </div>
        )}

        <div
          className={`${common["others"]} ${common[isText ? "text" : "file"]} ${
            common.bubble
          }`}
        >
          {isText ? (
            <Text message={payload as TextPayload} />
          ) : (
            <File
              chatType={isP2P ? "p2p" : "group"}
              onDownload={onDownload}
              type="others"
              file={payload as FilePayload}
              timestamp={timestamp}
            />
          )}
          <MessageTimestamp onSeen={onSeen} timestamp={timestamp} />
        </div>
      </IonItem>
    </>
  );
};

export default Others;
