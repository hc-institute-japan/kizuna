import { IonIcon, IonLabel, IonThumbnail } from "@ionic/react";
import { arrowRedo, documentOutline } from "ionicons/icons";
import React from "react";
import {
  FilePayload,
  Payload,
  TextPayload,
} from "../../../redux/commons/types";
import { Profile } from "../../../redux/profile/types";
import { isTextPayload } from "../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  message: {
    payload: Payload;
    author: Profile;
    id: string;
  };
}

const ReplyTo: React.FC<Props> = ({ message }) => {
  const isText = isTextPayload(message?.payload);
  const decoder = new TextDecoder();
  return (
    <div className={`ion-padding-start ion-padding-end ${styles["reply-to"]}`}>
      <IonIcon className="ion-padding-end" icon={arrowRedo}></IonIcon>

      {isText ? null : (message.payload as FilePayload)?.fileType ===
        "OTHER" ? (
        <IonIcon className="ion-padding-start" icon={documentOutline}></IonIcon>
      ) : (
        <IonThumbnail className={`${styles.thumbnail} ion-margin-start`}>
          <img
            src={
              (message?.payload as FilePayload)?.fileType === "VIDEO"
                ? URL.createObjectURL(
                    new Blob([
                      (message.payload as FilePayload)?.thumbnail as Uint8Array,
                    ])
                  )
                : decoder.decode((message?.payload as FilePayload)?.thumbnail)
            }
          ></img>
        </IonThumbnail>
      )}
      <div className={`${styles.content} ion-padding-start`}>
        <IonLabel>{message?.author.username}</IonLabel>
        <p className={styles["sub-label"]}>
          {isText
            ? (message?.payload as TextPayload)?.payload?.payload
            : (message?.payload as FilePayload)?.fileName}
        </p>
      </div>
    </div>
  );
};

export default ReplyTo;
