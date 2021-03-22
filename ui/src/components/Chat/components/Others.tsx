import React from "react";
import {
  isTextPayload,
  Payload,
  TextPayload,
} from "../../../redux/commons/types";
import styles from "./style.module.css";

export interface OthersProps {
  type?: "group" | "p2p";
  author: string;
  timestamp: Date;
  payload: Payload;
  readList: {
    [key: string]: Date;
  };
  showProfilePicture?: boolean;
}

const Others: React.FC<OthersProps> = ({
  author,
  type,
  timestamp,
  payload,
  readList,
  showProfilePicture,
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";
  return (
    <div className={styles["others-container"]}>
      {isP2P ? null : (
        <div className={styles.picture} style={{ marginRight: "0.5rem" }}>
          {showProfilePicture ? (
            <img src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/s1080x1080/163528151_952829552157741_3965471732380754680_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=109&_nc_ohc=J_UMfyNh00IAX_eoD0Z&ccb=7-4&oh=52c4031bd9c5cb1dfc9211af018e4d95&oe=607F179B&_nc_sid=86f79a"></img>
          ) : null}
        </div>
      )}

      <div className={styles.others}>
        {isText ? (payload as TextPayload).payload.payload : null}
      </div>
    </div>
  );
};

export default Others;
