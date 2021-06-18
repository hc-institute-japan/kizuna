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
import { addContact } from "../../../redux/contacts/actions";
import { Profile } from "../../../redux/profile/types";
import { useAppDispatch } from "../../../utils/helpers";

interface Props {
  contact: Profile;
  onCompletion(contact: Profile): void;
}

const AddContactItem: React.FC<Props> = ({ contact, onCompletion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleOnClick = () => {
    setIsLoading(true);
    dispatch(addContact(contact)).then((res: boolean) => {
      if (res) onCompletion(contact);
      else setIsLoading(false);
    });
  };

  return (
    <IonItem lines="none">
      <IonLabel>{contact.username}</IonLabel>
      <IonButtons slot="end">
        {isLoading ? (
          <IonSpinner />
        ) : (
          <IonButton onClick={handleOnClick}>
            <IonIcon icon={add}></IonIcon>
          </IonButton>
        )}
      </IonButtons>
    </IonItem>
  );
};

export default AddContactItem;
