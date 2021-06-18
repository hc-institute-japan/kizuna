import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../redux/profile/types";

interface Props {
  contact: Profile;
  onClick: (contact: Profile) => any;
}

const ContactItem: React.FC<Props> = ({ contact, onClick }) => {
  const handleOnClick = () => onClick(contact);

  return (
    <IonItem onClick={handleOnClick} lines="none">
      <IonLabel>{contact.username}</IonLabel>
    </IonItem>
  );
};

export default ContactItem;
