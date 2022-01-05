import { IonItem } from "@ionic/react";
import React from "react";
import AgentIdentifier from "../../../components/AgentIdentifier";
import { Profile } from "../../../redux/profile/types";

interface Props {
  contact: Profile;
  onClick: (contact: Profile) => any;
}

const ContactItem: React.FC<Props> = ({ contact, onClick }) => {
  const handleOnClick = () => onClick(contact);

  return (
    <IonItem onClick={handleOnClick}>
      <AgentIdentifier
        displayAvatar={true}
        avatar={contact.fields.avatar}
        nickname={contact.username}
        id={contact.id}
      />
    </IonItem>
  );
};

export default ContactItem;
