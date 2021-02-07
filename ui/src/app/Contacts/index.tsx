import { IonContent, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ContactsList from "../../components/ContactList";
import Spinner from "../../components/Spinner";
import Toolbar from "../../components/Toolbar";
import { fetchMyContacts } from "../../redux/contacts/actions";
import { RootState } from "../../redux/reducers";
import { indexContacts, useAppDispatch } from "../../utils/helpers";
import AddContactFAB from "./AddContact/AddContactFAB";
import AddContactModal from "./AddContact/AddContactModal";
import EmptyContacts from "./EmptyContacts";

const Contacts: React.FC = () => {
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>();
  const dispatch = useAppDispatch();

  /**
   * fetch all contacts here
   */

  useEffect(() => {
    setLoading(true);
    dispatch(fetchMyContacts()).then((res: any) => {
      setLoading(false);
    });
  }, [dispatch]);

  const indexedContacts = indexContacts(
    contacts.filter((contact) =>
      contact.username.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <IonPage>
      <Toolbar onChange={(e) => setSearch(e.detail.value!)} />
      <IonContent>
        {loading ? (
          <Spinner name="crescent" />
        ) : contacts.length !== 0 ? (
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
