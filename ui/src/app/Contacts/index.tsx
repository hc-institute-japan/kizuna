import { IonContent, IonPage } from "@ionic/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import ContactsList from "../../components/ContactList";
import Toolbar from "../../components/Toolbar";
import { RootState } from "../../redux/types";
import { indexContacts } from "../../utils/services/ConversionService";
import AddContactFAB from "./AddContact/AddContactFAB";
import AddContactModal from "./AddContact/AddContactModal";
import EmptyContacts from "./EmptyContacts";

const Contacts: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const contacts = useSelector((state: RootState) => state.contacts.contacts);

  const indexedContacts = indexContacts(
    Object.values(contacts).filter((contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <IonPage>
      <Toolbar onChange={(e) => setSearch(e.detail.value!)} />
      <IonContent>
        {Object.values(contacts).length !== 0 ? (
          <ContactsList
            displayMsgBtn={true}
            contacts={indexedContacts ? indexedContacts : {}}
          />
        ) : (
          <EmptyContacts />
        )}

        <AddContactModal
          contacts={contacts}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
        <AddContactFAB onClick={() => setIsOpen(true)} />
      </IonContent>
    </IonPage>
  );
};

export default Contacts;
