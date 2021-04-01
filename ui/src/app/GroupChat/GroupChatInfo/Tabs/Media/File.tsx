import { IonGrid, IonIcon, IonRow, IonText } from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import { base64ToUint8Array } from "../../../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  file: FilePayload;
}

const File: React.FC<Props> = ({ file }) => {
  const { fileName, fileSize } = file;
  const handleOnClick = () => {
    const blob = new Blob([base64ToUint8Array(file.fileHash)], {
      type: "application/pdf",
    }); // change resultByte to bytes

    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  };
  return (
    <IonGrid>
      <IonRow
        onClick={handleOnClick}
        className={`ion-align-items-center ${styles.file}`}
      >
        <div className="ion-padding-end">
          <IonIcon size="small" icon={documentOutline}></IonIcon>
        </div>
        <div className="ion-align-items-center">
          <IonRow>
            <IonText>
              <p className="ion-no-margin">{fileName}</p>
            </IonText>
          </IonRow>
          <IonRow>
            <IonText>
              <span>{(fileSize / 1024 / 1024).toFixed(2)} mb</span>
            </IonText>
          </IonRow>
        </div>
      </IonRow>
    </IonGrid>
  );
};

export default File;
