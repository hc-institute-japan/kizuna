import { IonContent, IonPage } from "@ionic/react";
import React from "react";
import Preference from "./Preference";
import SettingsHeader from "./SettingsHeader";
import styles from "./style.module.css";

const Settings: React.FC = () => {
  return (
    <IonPage>
      <SettingsHeader />
      <IonContent className={styles["settings-list"]}>
        <Preference />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
