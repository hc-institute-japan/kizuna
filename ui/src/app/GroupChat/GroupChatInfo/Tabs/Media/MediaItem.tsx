import { IonCard, IonItem } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import ImageView from "../../../../../components/Chat/File/ImageView/index";
import VideoView from "../../../../../components/Chat/File/VideoView";
import styles from "../../style.module.css";

interface Props {
  file?: FilePayload;
}

const MediaItem: React.FC<Props> = ({ file }) => {
  const decoder = new TextDecoder();

  const renderFile = () => {
    switch (file?.fileType) {
      case "IMAGE":
        return (
          <IonCard className={styles.mediacard}>
            <div className={styles.mediadiv}>
              <ImageView file={file} src={decoder.decode(file.thumbnail!)} />
            </div>
          </IonCard>
        );
      case "VIDEO":
        return (
          <IonCard className={styles.mediacard}>
            <div className={styles.mediadiv}>
              <VideoView file={file} />
            </div>
          </IonCard>
        );
      case "OTHER":
        return null;
      default:
        return null;
    }
  };

  return renderFile();
};

export default MediaItem;
