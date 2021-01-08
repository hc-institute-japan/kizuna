import { IonContent, IonPage } from "@ionic/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Toolbar from "../../components/Toolbar";
import { RootState } from "../../redux/reducers";
import { indexContacts } from "../../utils/helper";
import AddContactFAB from "./AddContactFAB";
import AddContactModal from "./AddContactModal";
import ContactsList from "./ContactsList";

const Contacts: React.FC = () => {
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const indexedContacts = indexContacts(
    contacts.filter((contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <IonPage>
      <Toolbar onChange={(e) => setSearch(e.detail.value!)} />
      <IonContent>
        <ContactsList contacts={indexedContacts} />
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
