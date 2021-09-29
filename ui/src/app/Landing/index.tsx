import {
  IonButton,
  IonContent,
  IonImg,
  IonPage,
  IonRouterLink,
} from "@ionic/react";
import React from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import styles from "./style.module.css";

const Landing: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className={styles.landing}>
          <IonImg src="assets/icon/kizuna_logo.png" className={styles.logo} />
          <div className={styles.actions}>
            {/* <IonButton href="/login" className="ion-margin-bottom">
              <FormattedMessage id="app.landing.login" />
            </IonButton> */}
            <IonRouterLink>
              {/* <IonText className={styles["register-label"]}>
                <FormattedMessage id="app.landing.register" />
              </IonText> */}
              <IonButton
                onClick={() => history.push({ pathname: `/register` })}
                className="ion-margin-bottom"
              >
                <FormattedMessage id="app.landing.register" />
              </IonButton>
            </IonRouterLink>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
