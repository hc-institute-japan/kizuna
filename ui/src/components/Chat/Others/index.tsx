import { IonItem, IonText } from "@ionic/react";
import React from "react";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import common from "../style.module.css";
import File from "../File";
import { ChatProps } from "../types";
import Text from "../Text";

const Others: React.FC<ChatProps> = ({
  author,
  type,
  timestamp,
  payload,
  readList,
  showProfilePicture,
  showName,
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";

  return (
    <>
      {isP2P ? null : showName ? (
        <div className={common["author-name"]}>
          <IonText color="medium">{author}</IonText>
        </div>
      ) : null}

      <IonItem lines="none" className={`${common["others-container"]}`}>
        {isP2P ? null : (
          <div className={common.picture} style={{ marginRight: "0.5rem" }}>
            {showProfilePicture ? (
              <img
                alt={`${author}'s profile`}
                src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/165950076_444388300151532_1799111197207173012_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=100&_nc_ohc=7z4YUOlGp6gAX90UHs8&ccb=7-4&oh=4bbdb3043f0a6668e67e143b769ce4be&oe=6066B770&_nc_sid=86f79a"
              ></img>
            ) : null}
          </div>
        )}

        {isText ? (
          <Text
            type="others"
            message={payload as TextPayload}
            timestamp={timestamp}
          />
        ) : (
          <File
            type="others"
            file={payload as FilePayload}
            timestamp={timestamp}
          />
        )}
      </IonItem>
    </>
  );
};

export default Others;