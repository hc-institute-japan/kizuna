import { IonText } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { FilePayload } from "../../../../redux/commons/types";
import File from "../File";
import Image from "../Image";
import styles from "./style.module.css";

interface Props {
  timestamp?: Date;
  file?: FilePayload;
}

const OthersFile: React.FC<Props> = ({ timestamp, file }) => {
  const intl = useIntl();
  const decoder = new TextDecoder();

  const renderFile = () => {
    switch (file?.fileType) {
      case "IMAGE":
        return <Image file={file} src={decoder.decode(file.thumbnail!)} />;
      case "OTHER":
        return <File file={file} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.others} ${styles.file}`}>
      {renderFile()}
      <IonText>
        <h6 className="ion-no-margin ion-text-end">
          {intl.formatTime(timestamp)}
        </h6>
      </IonText>
    </div>
  );
};

export default OthersFile;
