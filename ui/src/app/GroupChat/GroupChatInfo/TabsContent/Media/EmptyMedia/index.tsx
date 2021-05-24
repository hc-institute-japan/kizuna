import { IonIcon, IonText } from "@ionic/react";
import { sadOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const EmptyMedia: React.FC = () => {
  const intl = useIntl();
  return (
  <div className={styles["empty-media"]}>
    <IonIcon icon={sadOutline} size={"large"} />
    <IonText className={styles["no-media-label"]}>
      {intl.formatMessage({id: "app.group-chat.media.no-media"})}
    </IonText>
  </div>
  );
};

export default EmptyMedia;
