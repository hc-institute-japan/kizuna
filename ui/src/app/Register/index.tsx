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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const history = useHistory();

  const intl = useIntl();

  const handleOnChange = (e: CustomEvent) => {
    setNickname(e.detail.value!);
    setError(
      isUsernameFormatValid(e.detail.value!) && nickname.length >= 3
        ? null
        : intl.formatMessage({
            id: "app.register.error-invalid-username",
          })
    );
  };

  const handleOnSubmit = () => {
    setLoading(true);
    dispatch(createProfile(nickname)).then((res: any) => {
      if (!res) {
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
              />
            </div>
          </div>
          <IonButton onClick={handleOnSubmit} disabled={error ? true : false}>
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
