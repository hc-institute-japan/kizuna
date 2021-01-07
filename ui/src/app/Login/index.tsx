import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState } from "react";
import styles from "./style.module.css";

const Login: React.FC = () => {
  const [number, setNumber] = useState("");
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
              <IonLabel className={styles.label}>Phone Number</IonLabel>
              <IonInput
                value={number}
                onIonChange={(e) => setNumber(e.detail.value!)}
                placeholder="09451230512"
              ></IonInput>
            </div>
          </div>
          <IonButton>Login</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
