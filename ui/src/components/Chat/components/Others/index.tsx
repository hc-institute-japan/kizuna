import { IonText } from "@ionic/react";
import React from "react";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../../redux/commons/types";
import { ChatProps } from "../../types";
import OthersFile from "./OthersFile";
import OthersText from "./OthersText";
import styles from "./style.module.css";

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
        <div className={styles["author-name"]}>
          <IonText color="medium">{author}</IonText>
        </div>
      ) : null}
      <div className={styles["others-container"]}>
        {isP2P ? null : (
          <div className={styles.picture} style={{ marginRight: "0.5rem" }}>
            {showProfilePicture ? (
              <img src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/s1080x1080/163528151_952829552157741_3965471732380754680_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=109&_nc_ohc=J_UMfyNh00IAX_eoD0Z&ccb=7-4&oh=52c4031bd9c5cb1dfc9211af018e4d95&oe=607F179B&_nc_sid=86f79a"></img>
            ) : null}
          </div>
        )}

        {isText ? (
          <OthersText message={payload as TextPayload} timestamp={timestamp} />
        ) : (
          <OthersFile file={payload as FilePayload} timestamp={timestamp} />
        )}
      </div>
    </>
  );
};

export default Others;
