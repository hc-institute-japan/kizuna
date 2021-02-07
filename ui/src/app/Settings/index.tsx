import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonToggle,
} from "@ionic/react";
import React from "react";
import SettingsHeader from "./SettingsHeader";
import styles from "./style.module.css";

const Settings: React.FC = () => {
  return (
    <IonPage>
      <SettingsHeader />
      <IonContent>
        <IonList className={styles["settings-list"]}>
          <IonListHeader>
            <IonLabel>
              <h1>Preference</h1>
            </IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Read</IonLabel>
            <IonToggle />
          </IonItem>
          <IonItem>
            <IonLabel>Typing Indicator</IonLabel>
            <IonToggle />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
