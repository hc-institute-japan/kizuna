import {
  IonContent,
  IonHeader,
  IonModal,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import ContactsList from "../../components/ContactList";
import { IndexedContacts } from "../../redux/contacts/types";
import { RootState } from "../../redux/reducers";
import { indexContacts } from "../../utils/helpers";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
}

const NewChatModal: React.FC<Props> = ({ isOpen, onCancel }) => {
  let indexedContacts: IndexedContacts = useSelector((state: RootState) =>
    indexContacts(state.contacts.contacts)
  );

  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar showCancelButton="always" onIonCancel={onCancel} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ContactsList contacts={indexedContacts} />
      </IonContent>
    </IonModal>
  );
};

export default NewChatModal;
