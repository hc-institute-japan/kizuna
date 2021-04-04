import { IonCol, IonGrid, IonLabel, IonRow } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import { GroupMessage } from "../../../../../redux/group/types";
import { Profile } from "../../../../../redux/profile/types";
import MediaItem from "./MediaItem";
import styles from "../../style.module.css";

interface Props {
  indexedFileMessages?: {
    [key: string]: GroupMessage[];
  };
  index: string;
  fileMessages: GroupMessage[];
  onCompletion(contact: Profile): boolean;
  files: FilePayload[];
}

const AddMemberIndex: React.FC<Props> = ({
  index,
  files
}) => {
  return (
    <React.Fragment key={index}>
      <IonLabel className={styles["month"]}>{index}</IonLabel>
      <IonGrid>
      <IonRow className="ion-align-items-center ion-justify-content-center">
        {files.map((file) => (
            <IonCol size="3" className={styles["grid"]}>
              <MediaItem file={file}/>
            </IonCol>
        ))}
        </IonRow>
      </IonGrid>

    </React.Fragment>
  );
};

export default AddMemberIndex;
