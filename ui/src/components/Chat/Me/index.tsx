import { IonItem } from "@ionic/react";
import React from "react";
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
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";

  return (
    <IonItem lines="none" className={`${common["me-container"]}`}>
      {isText ? (
        <Text
          type="me"
          message={payload as TextPayload}
          timestamp={timestamp}
        />
      ) : (
        <File type="me" timestamp={timestamp} file={payload as FilePayload} />
      )}
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
