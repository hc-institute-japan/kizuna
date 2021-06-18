import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const NewConversationHeader = () => {
  const intl = useIntl();
  return (
    <IonHeader className={styles.header}>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>
          {intl.formatMessage({ id: "app.new-conversation.header-title" })}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default NewConversationHeader;
