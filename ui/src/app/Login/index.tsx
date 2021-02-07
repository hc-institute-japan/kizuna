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
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import styles from "./style.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const history = useHistory();

  const intl = useIntl();
  const dispatch = useDispatch();

  const log = () => {};
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
          <IonButton onClick={log}>
            {intl.formatMessage({ id: "app.login.login" })}
          </IonButton>
        </div>
      </IonContent>
      <IonLoading isOpen={false} />
    </IonPage>
  );
};

export default Login;
