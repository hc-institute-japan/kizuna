import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { add } from "ionicons/icons";
import React, { useState } from "react";
import { Profile } from "../../../redux/profile/types";

interface Props {
  contact: Profile;
  onCompletion(contact: Profile): void;
}

const AddContactItem: React.FC<Props> = ({ contact, onCompletion }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = (contact: Profile) => {
    setIsLoading(true);
  };
  return (
    <IonItem lines="none">
      <IonLabel>{contact.username}</IonLabel>
      <IonButtons slot="end">
        {isLoading ? (
          <IonSpinner />
        ) : (
          <IonButton onClick={() => handleOnClick(contact)}>
            <IonIcon icon={add}></IonIcon>
          </IonButton>
        )}
      </IonButtons>
    </IonItem>
  );
};

export default AddContactItem;
