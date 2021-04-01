import {
  IonItem,
  IonLabel,
} from "@ionic/react";
import React, { useState } from "react";
import { Profile } from "../../../../../redux/profile/types";

interface Props {
  contact: Profile;
  onCompletion(contact: Profile): boolean;
}

const AddMemberItem: React.FC<Props> = ({ contact, onCompletion }) => {
  const [selectedItem, setSelectedItem] = useState<boolean>(false);

  const handleOnClick = () => {
    let selected = onCompletion(contact);
    if (selected) setSelectedItem(selectedItem ? false : true);
  };

  return (
    <IonItem button onClick={handleOnClick} lines="none" color={selectedItem ? "primary" : ""} key={JSON.stringify(contact.id)} >
        <IonLabel>{contact.username}</IonLabel>
    </IonItem>
  );
};

export default AddMemberItem;
