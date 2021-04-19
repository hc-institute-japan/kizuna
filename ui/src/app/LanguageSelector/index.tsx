import { IonButton, IonPage, IonText } from "@ionic/react";
import React, { useState } from "react";
import styles from "./style.module.css";

const LanguageSelector: React.FC = () => {
  const [selected, setSelected] = useState(0);

  const languages = [
    { language: "English", code: "en" },
    { language: "Japanese", code: "jp" },
  ];

  const onSubmit = () => {};
  return (
    <IonPage>
      <div className={styles.page}>
        {languages.map(({ language }, i) => (
          <IonText
            onClick={() => setSelected(i)}
            {...(selected === i ? { color: "primary" } : {})}
          >
            <p>{language}</p>
          </IonText>
        ))}
      </div>
      <div className={styles["button-container"]}>
        <IonButton onClick={onSubmit} className={`${styles.button}`}>
          Select
        </IonButton>
      </div>
    </IonPage>
  );
};

export default LanguageSelector;
