import { IonCol, IonLabel, IonRow } from "@ionic/react";
import React, {useRef, useState } from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import { GroupMessage } from "../../../../../redux/group/types";
import { Profile } from "../../../../../redux/profile/types";
import styles from "../../style.module.css";
import MediaCol from "./MediaCol";

interface Props {
  indexedFileMessages?: {
    [key: string]: GroupMessage[];
  };
  index: string;
  fileMessages: GroupMessage[];
  onCompletion(contact: Profile): boolean;
  files: FilePayload[];
}

const MediaIndex: React.FC<Props> = ({ index, files }) => {
  const row = useRef<HTMLIonRowElement>(null);
  const [height, setHeight] = useState(0);

  return files.length > 0 ? (
    <React.Fragment key={index}>
      <IonRow>
        <IonCol>
          <IonLabel className={styles["month"]}>{index}</IonLabel>
        </IonCol>
      </IonRow>
      <IonRow className={styles["image-row"]}>
        {files.map((file, i) => (
          <MediaCol key={i} file={file} />
        ))}
      </IonRow>
    </React.Fragment>
  ) : null;
};

export default MediaIndex;
