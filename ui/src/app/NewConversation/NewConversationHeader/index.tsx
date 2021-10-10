import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import styles from "./style.module.css";

const NewConversationHeader = () => {
  const intl = useIntl();
  const history = useHistory();
  return (
    <IonHeader className={styles.header}>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton
            onClick={() => history.push({ pathname: `/home` })}
            className="ion-no-padding"
          >
            <IonIcon slot="icon-only" icon={arrowBackSharp} />
          </IonButton>
        </IonButtons>
        <IonTitle>
          {intl.formatMessage({ id: "app.new-conversation.header-title" })}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default NewConversationHeader;
