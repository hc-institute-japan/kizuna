import {
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonText,
} from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import React from "react";
import { FilePayload, Payload, TextPayload } from "../../redux/commons/types";
import { fetchFilesBytes } from "../../redux/group/actions";
import { getFileBytes } from "../../redux/p2pmessages/actions/getFileBytes";
import {
  convertSizeToReadableSize,
  isTextPayload,
  useAppDispatch,
} from "../../utils/helpers";
import VideoPlayer from "../VideoPlayer";
import styles from "./style.module.css";

interface Props {
  messages: { id: string; payload: Payload; author: string; date: Date }[];
  onMessageClick?(message: {
    id: string;
    payload: Payload;
    author: string;
    date: Date;
  }): any;
  type?: "p2p" | "group";
}

const PinnedMessages: React.FC<Props> = ({
  messages,
  onMessageClick,
  type = "group",
}) => {
  const decoder = new TextDecoder();
  const dispatch = useAppDispatch();
  const displayFile = (payload: FilePayload) => {
    switch (payload.fileType) {
      case "OTHER":
        return (
          <div className={`${styles["other"]} ion-padding`}>
            <IonIcon className="ion-margin-end" icon={documentOutline} />
            <div className={styles["file-details"]}>
              <IonText className={styles["file-name"]}>
                {payload.fileName}
              </IonText>

              <IonText className={styles["file-size"]}>
                {convertSizeToReadableSize(payload.fileSize)}
              </IonText>
            </div>
          </div>
        );
      case "IMAGE":
        return (
          <IonImg
            className={`${styles.thumbnail} ion-margin-end`}
            src={decoder.decode(payload?.thumbnail)}
          />
        );

      case "VIDEO": {
        return (
          <VideoPlayer
            className={styles.video}
            thumbnail={URL.createObjectURL(
              new Blob([payload.thumbnail as Uint8Array], {
                type: "image/jpeg",
              })
            )}
            onPlayPauseErrorHandler={(setErrorState: any) => {
              if (type === "p2p") {
                console.log(payload);
                dispatch(getFileBytes([payload.fileHash])).then((res: any) => {
                  if (res) {
                    setErrorState(false);
                  }
                });
              } else {
                dispatch(fetchFilesBytes([payload.fileHash])).then(
                  (res: any) => {
                    if (res) {
                      setErrorState(false);
                    }
                  }
                );
              }
            }}
            src={URL.createObjectURL(
              new Blob([payload.fileHash], {
                type: "video/mp4",
              })
            )}
          />
        );
      }
    }
  };

  return (
    <IonList>
      {messages.map((message, i) => {
        const isText = isTextPayload(message.payload);
        return (
          <IonItem
            key={i}
            button
            onClick={() => {
              if (onMessageClick) onMessageClick(message);
            }}
          >
            <div className={styles["content-container"]}>
              <div className={styles.header}>
                <IonLabel className={styles.author}>{message.author}</IonLabel>
                <IonNote className={`${styles.date} ion-padding-start`}>
                  {message.date.toDateString()}
                </IonNote>
              </div>
              {isText ? (
                <IonText>
                  {(message.payload as TextPayload).payload.payload}
                </IonText>
              ) : (
                displayFile(message.payload as FilePayload)
              )}
            </div>
          </IonItem>
        );
      })}
    </IonList>
  );
};

export default PinnedMessages;
