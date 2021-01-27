import {
  IonButton,
  IonContent,
  IonPage,
  IonRouterLink,
  IonText,
} from "@ionic/react";
import React from "react";
import styles from "./style.module.css";
import { FormattedMessage } from "react-intl";

const Landing: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className={styles.landing}>
        <IonText>Kizuna Logo</IonText>
        <div className={styles.actions}>
          <IonButton href="/login" className="ion-margin-bottom">
            <FormattedMessage id="app.landing.login" />
          </IonButton>
          <IonRouterLink href="/register">
            <IonText className={styles["register-label"]}>
              <FormattedMessage id="app.landing.register" />
            </IonText>
          </IonRouterLink>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default Landing;
