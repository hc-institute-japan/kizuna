import { IonIcon, IonText } from "@ionic/react";
import { sadOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const EmptyConversations = () => {
  const intl = useIntl();
  return (
    <div className={styles["empty-conversations"]}>
      <IonIcon icon={sadOutline} />
      <IonText className="ion-padding ion-margin-bottom">
        {intl.formatMessage({
          id: "app.conversations.empty-conversations-list",
        })}
      </IonText>
    </div>
  );
};

export default EmptyConversations;
