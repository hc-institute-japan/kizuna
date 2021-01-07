import {
  IonButton,
  IonContent,
  IonPage,
  IonRouterLink,
  IonText,
} from "@ionic/react";
import React from "react";
import styles from "./style.module.css";

const Landing: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className={styles.landing}>
          <IonText>Kizuna Logo</IonText>
          <div className={styles.actions}>
            <IonButton href="/login" className="ion-margin-bottom">
              Start Messaging
            </IonButton>
            <IonRouterLink href="/register">
              <IonText>Don't have an account?</IonText>
            </IonRouterLink>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
