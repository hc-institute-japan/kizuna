import { IonButton, IonButtons, IonHeader, IonLabel, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import styles from "../../style.module.css";

interface Props {
  onChange(e: CustomEvent): any;
  onCancel(): any;
}

const AddMemberHeader: React.FC<Props> = ({ onChange, onCancel }) => {
  const intl = useIntl();

  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons>
          <IonTitle className={styles["contacts"]}>
            {intl.formatMessage({id: "app.groups.add-member-contacts"})}
          </IonTitle>
          <IonButton className={styles["close-button"]} onClick={onCancel} slot="end">
            <IonLabel className={styles["close-label"]}>{intl.formatMessage({id: "app.groups.add-member-close"})}</IonLabel>
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonToolbar>
        <IonSearchbar onIonChange={onChange}/>
      </IonToolbar>
    </IonHeader>
  );
}

export default AddMemberHeader;
