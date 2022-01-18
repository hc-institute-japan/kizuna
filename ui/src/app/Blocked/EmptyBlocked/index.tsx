import { IonIcon, IonText } from "@ionic/react";
import { happyOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const EmptyBlocked: React.FC = () => {
  const intl = useIntl();
  return (
    <div className={styles["empty-contacts"]}>
      <IonIcon icon={happyOutline} />
      <IonText className="ion-padding ion-margin-bottom">
        {intl.formatMessage({ id: "app.blocked.empty-blocked-list" })}
      </IonText>
    </div>
  );
};

export default EmptyBlocked;
