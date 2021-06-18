import { IonContent, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ContactsList from "../../components/ContactList";
import Spinner from "../../components/Spinner";
import Toolbar from "../../components/Toolbar";
import { fetchMyContacts } from "../../redux/contacts/actions";
import { RootState } from "../../redux/types";
import { indexContacts, useAppDispatch } from "../../utils/helpers";
import AddContactFAB from "./AddContact/AddContactFAB";
import AddContactModal from "./AddContact/AddContactModal";
import EmptyContacts from "./EmptyContacts";

const Contacts: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>();
  const dispatch = useAppDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchMyContacts()).then((res: any) => {
      setLoading(false);
    });
  }, [dispatch]);

  const indexedContacts = indexContacts(
    Object.values(contacts).filter((contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <IonPage>
      <Toolbar onChange={(e) => setSearch(e.detail.value!)} />
      <IonContent>
        {loading ? (
          <Spinner name="crescent" />
        ) : Object.values(contacts).length !== 0 ? (
          <ContactsList contacts={indexedContacts} />
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
