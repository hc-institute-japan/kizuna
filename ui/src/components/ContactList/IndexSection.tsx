import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../redux/profile/types";
import ContactItem from "./ContactItem";

interface Props {
  char: string;
  contacts: Profile[];
}

const IndexSection: React.FC<Props> = ({ char, contacts }) => (
  <React.Fragment key={char}>
    <IonItemDivider>
      <IonLabel>{char}</IonLabel>
    </IonItemDivider>
    {contacts.map((contact) => (
      <ContactItem key={JSON.stringify(contact)} contact={contact} />
    ))}
  </React.Fragment>
);

export default IndexSection;
