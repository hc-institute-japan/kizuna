import { IonChip, IonIcon, IonLabel, IonRow } from "@ionic/react";
import { close } from "ionicons/icons";
import React, { Dispatch, SetStateAction } from "react";
import styles from "./style.module.css";

interface Props {
  files: any[];
  setFiles: Dispatch<SetStateAction<any[]>>;
}
const FileView: React.FC<Props> = ({ files, setFiles }) => {
  const handleClose = (index: number) => {
    setFiles((currFiles) => {
      currFiles.splice(index, 1);
      return [...currFiles];
    });
  };

  return (
    <IonRow className={styles.row}>
      {files.map((file, index) => (
        <IonChip className={styles.chip} key={index}>
          <IonLabel>{file.metadata.fileName}</IonLabel>
          <IonIcon icon={close} onClick={() => handleClose(index)}></IonIcon>
        </IonChip>
      ))}
    </IonRow>
  );
};

export default FileView;
