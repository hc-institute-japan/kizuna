import { IonButton, IonButtons, IonInput, IonItem, IonLabel, IonLoading, IonTitle, IonToolbar } from "@ionic/react";
import React, {  useState } from "react";
import { GroupConversation } from "../../../redux/group/types";
import styles from "../style.module.css";


interface Props {
  isOpen: boolean;
  onCancel: () => void;
  groupData: GroupConversation;
  onSave: (x? : any) => void;
  loading: boolean;
}

const UpdateGroupName: React.FC<Props> = ({ onCancel, groupData, onSave, loading}) => {
  const [name, setName] = useState<string>("");
  const handleOnChange = (e: CustomEvent) => setName(e.detail.value!);
  return (!loading) ? (

      <div className={styles.modal}>

      <IonToolbar>
        <IonTitle>Edit Group</IonTitle>
      </IonToolbar>

      <IonItem className="input">
        <IonLabel color="medium" position="floating">Group Name</IonLabel>
        <IonInput clearInput className={styles["ion-input"]} value={name} onIonChange={handleOnChange}></IonInput>
      </IonItem>

      <IonButtons slot="end" className="input">
        <IonButton slot="end" onClick={onCancel}>
          <IonLabel>Cancel</IonLabel>
        </IonButton>
        <IonButton disabled={!name.length ? true : false} slot="end" onClick={() => {
          onSave(name);
          setName("");
        }}>
          <IonLabel>Save</IonLabel>
        </IonButton>
      </IonButtons>

      </div>
  ) : <IonLoading isOpen={loading} />;
};

export default UpdateGroupName;
