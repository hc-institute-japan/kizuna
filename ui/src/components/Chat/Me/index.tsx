import { IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { checkmarkDoneOutline, checkmarkOutline } from "ionicons/icons";
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

const Me: React.FC<ChatProps> = ({
  payload,
  author,
  timestamp,
  type,
  showProfilePicture,
  isSeen = false,
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
          <Text
            type="me"
            message={payload as TextPayload}
            timestamp={timestamp}
          />
        ) : (
          <File type="me" timestamp={timestamp} file={payload as FilePayload} />
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
              alt={`${author}'s profile`}
              src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/165950076_444388300151532_1799111197207173012_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=100&_nc_ohc=7z4YUOlGp6gAX90UHs8&ccb=7-4&oh=4bbdb3043f0a6668e67e143b769ce4be&oe=6066B770&_nc_sid=86f79a"
            />
          ) : null}
        </div>
      )}
    </IonItem>
  );
};

export default Me;
