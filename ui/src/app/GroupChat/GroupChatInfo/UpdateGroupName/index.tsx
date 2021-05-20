import { IonButton, IonButtons, IonInput, IonItem, IonLabel, IonLoading, IonTitle, IonToolbar } from "@ionic/react";
import React, {  useState } from "react";
import { useIntl } from "react-intl";
import { GroupConversation } from "../../../../redux/group/types";
import styles from "../style.module.css";


interface Props {
  isOpen: boolean;
  onCancel: () => void;
  groupData: GroupConversation;
  onSave: (x? : any) => void;
  loading: boolean;
}

const UpdateGroupName: React.FC<Props> = ({ onCancel, groupData, onSave, loading}) => {
  const intl = useIntl();
  const [name, setName] = useState<string>("");
  const handleOnChange = (e: CustomEvent) => setName(e.detail.value!);
  return (!loading) ? (

      <div className={styles.modal}>

      <IonToolbar>
        <IonTitle>{intl.formatMessage({id: "app.group-chat.update-group-name-title"})}</IonTitle>
      </IonToolbar>

      <IonItem className="input">
        <IonLabel color="medium" position="floating">{intl.formatMessage({id: "app.group-chat.update-group-name-placeholder"})}</IonLabel>
        <IonInput clearInput className={styles["ion-input"]} value={name} onIonChange={handleOnChange}></IonInput>
      </IonItem>

      <IonButtons slot="end" className="input">
        <IonButton slot="end" onClick={onCancel}>
          <IonLabel>{intl.formatMessage({id: "app.group-chat.update-group-name-cancel"})}</IonLabel>
        </IonButton>
        <IonButton disabled={!name.length ? true : false} slot="end" onClick={() => {
          onSave(name);
          setName("");
        }}>
          <IonLabel>{intl.formatMessage({id: "app.group-chat.update-group-name-save"})}</IonLabel>
        </IonButton>
      </IonButtons>

      </div>
  ) : <IonLoading isOpen={loading} />;
};

export default UpdateGroupName;
