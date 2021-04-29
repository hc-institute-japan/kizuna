import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import React from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { setLanguage } from "../../redux/language/actions";
import { Languages } from "../../redux/language/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";

const languages: Languages[] = [
  { language: "English", code: "en" },
  { language: "Japanese", code: "jp" },
];

const LanguageDropdown: React.FC = () => {
  const intl = useIntl();
  const selectedLanguage = useSelector(
    (state: RootState) => state.language.language
  );

  const selected = languages.find(
    (language) => language.code === selectedLanguage
  );

  const dispatch = useAppDispatch();
  const history = useHistory();

  return (
    <IonList>
      <IonListHeader>
        {intl.formatMessage({ id: "app.settings.language-label" })}
      </IonListHeader>
      <IonItem>
        <IonSelect
          interfaceOptions={styles.dropdown}
          onIonChange={(value) => {
            dispatch(setLanguage(value.detail.value));
            history.push("/");
          }}
          slot="end"
          value={selected!.code}
        >
          {languages.map((language) => (
            <IonSelectOption value={language.code}>
              {language.language}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    </IonList>
  );
};

export default LanguageDropdown;
