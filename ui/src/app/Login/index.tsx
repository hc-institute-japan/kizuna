import { useLazyQuery } from "@apollo/client";
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
import ME from "../../graphql/profile/queries/me";
import { useDispatch } from "react-redux";
import { setUsername as setReduxUsername } from "../../redux/profile/actions";
import { useHistory } from "react-router";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const history = useHistory();
  const [login, { loading }] = useLazyQuery(ME, {
    onCompleted: (data) => {
      const { username = null } = { ...data.setUsername };
      dispatch(setReduxUsername(username));
      if (username) history.push("/");
    },
  });
  const intl = useIntl();
  const dispatch = useDispatch();

  const log = () => {
    login({
      variables: {
        username,
      },
    });
  };
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
      <IonLoading isOpen={loading}></IonLoading>
    </IonPage>
  );
};

export default Login;
