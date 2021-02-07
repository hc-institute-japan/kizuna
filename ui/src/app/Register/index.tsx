import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import HomeInput from "../../components/Input/HomeInput";
import { isUsernameFormatValid } from "../../utils/regex";
import styles from "./style.module.css";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const history = useHistory();

  // useEffect(() => {
  //   if (loading) {
  //     setIsValid(true);
  //   }
  // }, [loading]);

  const intl = useIntl();

  const handleOnChange = (e: CustomEvent) => {
    setUsername(e.detail.value!);
    setIsValid(isUsernameFormatValid(e.detail.value!));
  };

  useEffect(() => {
    setError(
      !isValid
        ? intl.formatMessage({
            id: "app.register.error-invalid-username",
          })
        : null
    );
  }, [isValid, intl]);

  const handleOnSubmit = () => {};

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
        <div className={styles.register}>
          <div className={styles.form}>
            <div>
              <IonLabel className={styles.label}>
                {intl.formatMessage({
                  id: "app.register.username-label",
                })}
              </IonLabel>
              <HomeInput
                value={username}
                onIonChange={handleOnChange}
                placeholder={intl.formatMessage({
                  id: "app.register.username-placeholder",
                })}
                error={error}
                debounce={600}
              ></HomeInput>
            </div>
          </div>
          <IonButton onClick={handleOnSubmit} disabled={!isValid}>
            {intl.formatMessage({
              id: "app.register.register",
            })}
          </IonButton>
        </div>
        <IonLoading isOpen={false} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
