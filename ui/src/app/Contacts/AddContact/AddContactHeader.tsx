import { IonHeader, IonSearchbar, IonToolbar } from "@ionic/react";
import React from "react";

interface Props {
  onChange(e: CustomEvent): any;
  onCancel(): any;
}

const AddContactHeader: React.FC<Props> = ({ onChange, onCancel }) => (
  <IonHeader>
    <IonToolbar>
      <IonSearchbar
        showCancelButton="always"
        onIonChange={onChange}
        onIonCancel={onCancel}
      />
    </IonToolbar>
  </IonHeader>
);

export default AddContactHeader;
