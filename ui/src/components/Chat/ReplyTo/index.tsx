import { IonIcon, IonLabel, IonThumbnail } from "@ionic/react";
import { arrowRedo, arrowUndo, documentOutline } from "ionicons/icons";
import React, { useRef, useState } from "react";
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
  const className = [`${styles["reply-to"]}`];

  return (
    <div className={className.join(" ")}>
      <div className={`${styles["vertical-divider"]} ion-margin-end`}></div>
      {isText ? null : (message.payload as FilePayload)?.fileType ===
        "OTHER" ? (
        <IonIcon className="ion-margin-end" icon={documentOutline}></IonIcon>
      ) : (
        <IonThumbnail className={`${styles.thumbnail} ion-margin-end`}>
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
      <div className={`${styles.content}`}>
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
