import { IonGrid, IonIcon, IonLabel, IonRow, IonText } from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import React from "react";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../redux/commons/types";
import { RootState } from "../../../redux/types";
import { base64ToUint8Array } from "../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  file: FilePayload;
}

const File: React.FC<Props> = ({ file }) => {
  const { fileName, fileSize } = file;
  const fileBytes = useSelector(
    (state: RootState) => state.groups.groupFiles[`u${file.fileHash}`]
  );
  const handleOnClick = () => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  };

  const renderSize = () => {
    const size =
      (fileSize / 1024 / 1024).toFixed(2) === "0.00"
        ? `${(fileSize / 1024 / 1024).toFixed(2)}mb`
        : `${(fileSize / 1024).toFixed(2)}kb`;
    return size;
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
            <IonLabel className={`${styles["file-name"]}`}>
              <p className="ion-no-margin ion-text-wrap">{fileName}</p>
            </IonLabel>
          </IonRow>
          <IonRow>
            <IonText>
              <span>{renderSize()}</span>
            </IonText>
          </IonRow>
        </div>
      </IonRow>
    </IonGrid>
  );
};

export default File;
