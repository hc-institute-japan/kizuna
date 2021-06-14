import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../../../../redux/profile/types";

interface Props {
  contact: Profile;
  selected: boolean;
  onSelected(contact: Profile): void;
}

const AddMemberItem: React.FC<Props> = ({ contact, selected, onSelected }) => {
  const handleOnClick = () => onSelected(contact);

  return (
    <IonItem
      button
      onClick={handleOnClick}
      lines="none"
      color={selected ? "primary" : ""}
      key={JSON.stringify(contact.id)}
    >
      <IonLabel>{contact.username}</IonLabel>
    </IonItem>
  );
};

export default AddMemberItem;
