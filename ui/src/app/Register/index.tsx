import { useMutation } from "@apollo/client";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import HomeInput from "../../components/Input/HomeInput";
import { isUsernameFormatValid } from "../../utils/regex";
import styles from "./style.module.css";
import SET_USERNAME from "../../graphql/profile/mutations/setUsername";
import { useIntl } from "react-intl";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [set] = useMutation(SET_USERNAME, {
    onCompleted: (data) => {},
  });
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

  const handleOnSubmit = () => {
    set({
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
      </IonContent>
    </IonPage>
  );
};

export default Register;
