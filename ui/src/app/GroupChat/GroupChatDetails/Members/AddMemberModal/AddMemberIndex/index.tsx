import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../../../../redux/profile/types";
import AddContactItem from "../AddMemberItem";

interface Props {
  index: string;
  contacts: Profile[];
  selected: Profile[];
  onSelected(contact: Profile): void;
}

const AddMemberIndex: React.FC<Props> = ({
  index,
  contacts,
  onSelected,
  selected,
}) => {
  return (
    <React.Fragment key={index}>
      <IonItemDivider>
        <IonLabel>{index}</IonLabel>
      </IonItemDivider>
      {contacts.map((contact) => {
        return (
          <AddContactItem
            key={JSON.stringify(contact.id)}
            onSelected={onSelected}
            selected={selected.includes(contact) ? true : false}
            contact={contact}
          />
        );
      })}
    </React.Fragment>
  );
};

export default AddMemberIndex;
