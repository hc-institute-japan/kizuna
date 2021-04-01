import { IonButton, IonButtons, IonHeader, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react";
import React from "react";

interface Props {
  onChange(e: CustomEvent): any;
  onCancel(): any;
}

const AddMemberHeader: React.FC<Props> = ({ onChange, onCancel }) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons>
        <IonTitle>
          Contacts
        </IonTitle>
        <IonButton onClick={onCancel} slot="end">
          Close
        </IonButton>
      </IonButtons>
    </IonToolbar>
    <IonToolbar>
      <IonSearchbar onIonChange={onChange}/>
    </IonToolbar>
  </IonHeader>
);

export default AddMemberHeader;
