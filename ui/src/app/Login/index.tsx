import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const intl = useIntl();

  const handleOnClick = () => {};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.login}>
          <div className={styles.form}>
            <div>
              <IonLabel className={styles.label}>
                {intl.formatMessage({ id: "app.login.username-label" })}
              </IonLabel>
              <IonInput
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
                placeholder={intl.formatMessage({
                  id: "app.login.username-placeholder",
                })}
              />
            </div>
          </div>
          <IonButton onClick={handleOnClick}>
            {intl.formatMessage({ id: "app.login.login" })}
          </IonButton>
        </div>
      </IonContent>
      <IonLoading isOpen={false} />
    </IonPage>
  );
};

export default Login;
