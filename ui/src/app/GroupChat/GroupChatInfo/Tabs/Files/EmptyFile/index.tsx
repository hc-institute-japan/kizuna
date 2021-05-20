import { IonIcon, IonText } from "@ionic/react";
import { sadOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const EmptyFile: React.FC = () => {
  const intl = useIntl();
  return (
  <div className={styles["empty-files"]}>
    <IonIcon icon={sadOutline} size={"large"} />
    <IonText className={styles["no-file-label"]}>
      {intl.formatMessage({id: "app.group-chat.files.no-files"})}
    </IonText>
  </div>
  );
};

export default EmptyFile;
