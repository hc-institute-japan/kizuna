import { deserializeHash } from "@holochain-open-dev/core-types";
import { IonGrid, IonIcon, IonLabel, IonRow, IonText } from "@ionic/react";
import React from "react";
import { documentOutline } from "ionicons/icons";
import { FilePayload } from "../../../../../redux/commons/types";
import { convertSizeToReadableSize } from "../../../../../utils/helpers";

interface Props {
  file: FilePayload;
}

/* TODO: This will be replaced by the use of Component */
const File: React.FC<Props> = ({ file }) => {
  const { fileName, fileSize } = file;
  const handleOnClick = () => {
    const blob = new Blob([deserializeHash(file.fileHash)]); // change resultByte to bytes

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  };
  return (
    <IonGrid>
      <IonRow onClick={handleOnClick} className={`ion-align-items-center`}>
        <div className="ion-padding-end">
          <IonIcon size="small" icon={documentOutline}></IonIcon>
        </div>
        <div className="ion-align-items-center">
          <IonRow>
            <IonLabel className="ion-text-wrap">
              <p className="ion-no-margin">{fileName}</p>
            </IonLabel>
          </IonRow>
          <IonRow>
            <IonText>
              <span>{convertSizeToReadableSize(fileSize)} mb</span>
            </IonText>
          </IonRow>
        </div>
      </IonRow>
    </IonGrid>
  );
};

export default File;
