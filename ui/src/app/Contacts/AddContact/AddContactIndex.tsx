import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../redux/profile/types";
import AddContactItem from "./AddContactItem";

interface Props {
  index: string;
  contacts: Profile[];
  onCompletion(contact: Profile): void;
}

const AddContactIndex: React.FC<Props> = ({
  index,
  contacts,
  onCompletion,
}) => {
  return (
    <React.Fragment>
      <IonItemDivider>
        <IonLabel>{index}</IonLabel>
      </IonItemDivider>
      {contacts.map((contact) => (
        <AddContactItem
          key={JSON.stringify(contact.id)}
          contact={contact}
          onCompletion={onCompletion}
        />
      ))}
    </React.Fragment>
  );
};

export default AddContactIndex;
