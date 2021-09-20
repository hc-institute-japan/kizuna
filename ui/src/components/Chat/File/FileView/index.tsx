import { IonGrid, IonIcon, IonLabel, IonRow, IonText } from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import React from "react";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../../redux/commons/types";
import { RootState } from "../../../../redux/types";
import { convertSizeToReadableSize } from "../../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  file: FilePayload;
  onDownload?(file: FilePayload): any;
  darken?: boolean;
  err?: boolean;
}

const File: React.FC<Props> = ({ file, onDownload, darken = false, err }) => {
  const { fileName, fileSize } = file;
  const fileBytes = useSelector((state: RootState) =>
    // state.groups.groupFiles[`u${file.fileHash}`]
    {
      let fileSet = Object.assign(
        {},
        state.groups.groupFiles,
        state.p2pmessages.files
      );
      return fileSet[file.fileHash!];
    }
  );
  const download = () => {
    if (fileBytes) {
      const blob = new Blob([fileBytes]); // change resultByte to bytes

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
    }
  };

  const renderSize = () => {
    return convertSizeToReadableSize(fileSize);
  };
  return (
    <IonGrid>
      <IonRow
        onClick={
          err ? () => null : onDownload ? () => onDownload(file) : download
        }
        className={`ion-align-items-center ${styles.file}`}
      >
        <div className="ion-padding-end">
          <IonIcon
            className={styles[darken ? "file-icon-dark" : "file-icon-light"]}
            size="small"
            icon={documentOutline}
          ></IonIcon>
        </div>
        <div className="ion-align-items-center">
          <IonRow>
            <IonLabel className={`${styles["file-name"]}`}>
              <p className="ion-no-margin ion-text-wrap">{fileName}</p>
            </IonLabel>
          </IonRow>
          <IonRow>
            <IonText className={styles["file-size"]}>
              <span>{renderSize()}</span>
            </IonText>
          </IonRow>
        </div>
      </IonRow>
    </IonGrid>
  );
};

export default File;
