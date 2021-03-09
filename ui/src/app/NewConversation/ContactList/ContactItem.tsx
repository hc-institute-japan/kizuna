import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../redux/profile/types";
import { Uint8ArrayToBase64 } from "../../../utils/helpers";

interface Props {
  contact: Profile;
  onClick: (contact: Profile) => any;
}

const ContactItem: React.FC<Props> = ({ contact, onClick }) => {
  const handleOnClick = () => onClick(contact);

  return (
    <IonItem
      onClick={handleOnClick}
      lines="none"
      key={Uint8ArrayToBase64(contact.id)}
    >
      <IonLabel>{contact.username}</IonLabel>
    </IonItem>
  );
};

export default ContactItem;
