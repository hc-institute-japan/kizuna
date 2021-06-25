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
import { useHistory } from "react-router";
import HomeInput from "../../components/Input/HomeInput";
import { createProfile } from "../../redux/profile/actions";
import { useAppDispatch } from "../../utils/helpers";
import { isUsernameFormatValid } from "../../utils/regex";
import styles from "./style.module.css";

const Register: React.FC = () => {
  const [nickname, setNickname] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const history = useHistory();

  const intl = useIntl();

  const handleOnChange = (e: CustomEvent) => {
    setNickname(e.detail.value!);
    setError(
      isUsernameFormatValid(e.detail.value!)
        ? null
        : intl.formatMessage({
            id: "app.register.error-invalid-username",
          })
    );
  };

  useEffect(() => {
    if (error) {
      setIsValid(false);
    } else {
      if (nickname.length >= 3) setIsValid(true);
    }
  }, [error, nickname.length]);

  const handleOnSubmit = () => {
    setLoading(true);
    dispatch(createProfile(nickname)).then((res: any) => {
      if (res) {
        history.push("/");
      } else {
        setError(
          intl.formatMessage({
            id: "app.register.error-existing-username",
          })
        );
        setLoading(false);
      }
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
                value={nickname}
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
        <IonLoading isOpen={loading} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
