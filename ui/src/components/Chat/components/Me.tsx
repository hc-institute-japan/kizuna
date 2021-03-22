import { IonAvatar } from "@ionic/react";
import React from "react";
import {
  isTextPayload,
  Payload,
  TextPayload,
} from "../../../redux/commons/types";
import styles from "./style.module.css";

export interface MeProps {
  type?: "group" | "p2p";
  author: string;
  timestamp: Date;
  payload: Payload;
  readList: {
    [key: string]: Date;
  };
  showProfilePicture?: boolean;
}

const Me: React.FC<MeProps> = ({
  payload,
  author,
  timestamp,
  readList,
  type,
  showProfilePicture,
}) => {
  console.log(showProfilePicture);
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";

  return (
    <div className={styles["me-container"]}>
      <div className={styles.me}>
        {isText ? (payload as TextPayload).payload.payload : null}
      </div>
      {isP2P ? null : (
        <div className={styles.picture} style={{ marginLeft: "0.5rem" }}>
          {showProfilePicture ? (
            <img src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/s1080x1080/163528151_952829552157741_3965471732380754680_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=109&_nc_ohc=J_UMfyNh00IAX_eoD0Z&ccb=7-4&oh=52c4031bd9c5cb1dfc9211af018e4d95&oe=607F179B&_nc_sid=86f79a"></img>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Me;
