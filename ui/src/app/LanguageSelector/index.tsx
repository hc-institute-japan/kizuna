import { IonButton, IonPage, IonText } from "@ionic/react";
import React, { useState } from "react";
import { setLanguage } from "../../redux/language/actions";
import { Languages, languages } from "../../redux/language/types";
import { useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";

const LanguageSelector: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const dispatch = useAppDispatch();

  const languages: Languages[] = [
    { language: "English", code: "en" },
    { language: "Japanese", code: "jp" },
  ];

  const onSubmit = () => {
    dispatch(setLanguage(languages[selected].code));
  };
  return (
    <IonPage>
      <div className={styles.page}>
        <div className={styles["language-container"]}>
          {languages.map(({ language }, i) => (
            <IonText
              className={`${styles.language}${
                selected === i ? ` ${styles.selected}` : ""
              }`}
              onClick={() => setSelected(i)}
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
      </div>
    </IonPage>
  );
};

export default LanguageSelector;
