import { IonChip, IonIcon, IonLabel, IonRow } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
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
  const decoder = new TextDecoder();

  return (
    <IonRow className={styles.row}>
      {files.map((file, index) => {
        return (
          <IonChip
            {...(file.fileType.type === "IMAGE" ||
            file.fileType.type === "VIDEO"
              ? {
                  style: {
                    backgroundImage: `url(${decoder.decode(
                      file.fileType.thumbnail
                    )})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  },
                }
              : {})}
            className={styles.chip}
            key={index}
          >
            {file.fileType.type === "IMAGE" ||
            file.fileType.type === "VIDEO" ? null : (
              <IonLabel>{file.metadata.fileName}</IonLabel>
            )}
            <IonIcon icon={closeCircle} onClick={() => handleClose(index)} />
          </IonChip>
        );
      })}
    </IonRow>
  );
};

export default FileView;
