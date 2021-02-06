import { useMutation } from "@apollo/client";
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
import ADD_CONTACTS from "../../../graphql/contacts/mutations/addContacts";

interface Props {
  contact: Profile;
  onCompletion(contact: Profile): void;
}

const AddContactItem: React.FC<Props> = ({ contact, onCompletion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [addContacts] = useMutation(ADD_CONTACTS, {
    onCompleted: (data) => {
      const { addContacts = null } = { ...data };
      if (addContacts) {
        onCompletion(contact);
      }

      setIsLoading(false);
    },
  });

  const handleOnClick = (contact: Profile) => {
    setIsLoading(true);

    addContacts({ variables: { contacts: [contact] } });
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
