import { IonCol } from "@ionic/react";
import React from "react";
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

const MediaIndex: React.FC<Props> = ({ index, files }) => files.length > 0 ? (
    <React.Fragment key={index}>
      <IonCol size="12">
        <h2 className={styles.month}>{index}</h2>
      </IonCol>
      {files.map((file, i) => (
        <MediaCol key={i} file={file} />
      ))}
    </React.Fragment>
  ) : null;

export default MediaIndex;
