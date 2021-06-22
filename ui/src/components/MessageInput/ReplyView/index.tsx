import { IonIcon, IonThumbnail } from "@ionic/react";
import { closeCircleOutline, documentsOutline } from "ionicons/icons";
import React, { Dispatch, SetStateAction } from "react";
import styles from "./style.module.css";

interface Props {
  messageState: [any, Dispatch<SetStateAction<any>>];
}

const ReplyView: React.FC<Props> = ({ messageState }) => {
  const [message, setMessage] = messageState;
  const displayPayload = () => {
    if (message.payload.type === "TEXT")
      return (
        <div className={`${styles.column} ion-padding-start`}>
          <span className={styles.author}>{message.author}</span>
          <span className={styles.text}>{message.payload.payload.payload}</span>
        </div>
      );
    else {
      switch (message.payload.fileType) {
        case "OTHER": {
          return (
            <div className={`${styles.row} ion-padding-start`}>
              <IonIcon icon={documentsOutline}></IonIcon>
              <div className={`${styles.column} ion-padding-start`}>
                <span className={styles.author}>{message.author}</span>
                <span className={styles.text}>{message.payload.fileName}</span>
              </div>
            </div>
          );
        }
        case "IMAGE":
        case "VIDEO": {
          const decoder = new TextDecoder();

          return (
            <div>
              <div className={`${styles.row} ion-padding-start`}>
                <IonThumbnail className={styles.thumbnail}>
                  <img
                    src={
                      message.payload.fileType === "VIDEO"
                        ? URL.createObjectURL(
                            new Blob([message.payload.thumbnail as Uint8Array])
                          )
                        : decoder.decode(message.payload.thumbnail)
                    }
                  ></img>
                </IonThumbnail>
                <div className={`${styles.column} ion-padding-start`}>
                  <span className={styles.author}>{message.author}</span>
                  <span className={styles.text}>
                    {message.payload.fileName}
                  </span>
                </div>
              </div>
            </div>
          );
        }
        default:
          return null;
      }
    }
  };

  return (
    <div
      className={`ion-padding-start ion-padding-end ${styles.row} ${styles.reply}`}
    >
      <IonIcon
        icon={closeCircleOutline}
        onClick={() => {
          setMessage(null);
        }}
      ></IonIcon>
      {displayPayload()}
    </div>
  );
};

export default ReplyView;
