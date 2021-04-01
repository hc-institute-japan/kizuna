import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { IndexedContacts } from "../../../../../redux/contacts/types";
import { Profile } from "../../../../../redux/profile/types";
import AddContactItem from "./AddMemberItem";

interface Props {
  indexedContacts?: IndexedContacts;
  index: string;
  contacts: Profile[];
  onCompletion(contact: Profile): boolean;
}

const AddMemberIndex: React.FC<Props> = ({
  index,
  contacts,
  onCompletion,
  indexedContacts
}) => {
  return (
    <React.Fragment key={index}>
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

export default AddMemberIndex;
