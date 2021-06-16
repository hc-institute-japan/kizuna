import {
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import styles from "../style.module.css";

interface Props {
  onCancel: () => void;
  onSave: (newGroupName: string) => void;
  setName: React.Dispatch<React.SetStateAction<string>>;
  name: string;
}

const UpdateGroupName: React.FC<Props> = ({
  onCancel,
  onSave,
  setName,
  name,
}) => {
  const intl = useIntl();
  const handleOnChange = (e: CustomEvent) => setName(e.detail.value!);
  return (
    <div className={styles.modal}>
      <IonToolbar>
        <IonTitle>
          {intl.formatMessage({ id: "app.group-chat.update-group-name-title" })}
        </IonTitle>
      </IonToolbar>

      <IonItem className="input">
        <IonLabel color="medium" position="floating">
          {intl.formatMessage({
            id: "app.group-chat.update-group-name-placeholder",
          })}
        </IonLabel>
        <IonInput
          clearInput
          className={styles["ion-input"]}
          value={name}
          onIonChange={handleOnChange}
        ></IonInput>
      </IonItem>

      <IonButtons slot="end" className="input">
        <IonButton slot="end" onClick={onCancel}>
          <IonLabel>
            {intl.formatMessage({
              id: "app.group-chat.update-group-name-cancel",
            })}
          </IonLabel>
        </IonButton>
        <IonButton
          disabled={!name.length ? true : false}
          slot="end"
          onClick={() => {
            onSave(name);
          }}
        >
          <IonLabel>
            {intl.formatMessage({
              id: "app.group-chat.update-group-name-save",
            })}
          </IonLabel>
        </IonButton>
      </IonButtons>
    </div>
  );
};

export default UpdateGroupName;
