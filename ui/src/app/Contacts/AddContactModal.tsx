import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonContent,
  IonList,
  IonLabel,
  IonItem,
  IonItemDivider,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import React from "react";
import { IndexedContacts } from "../../redux/contacts/types";
import { indexContacts } from "../../utils/helpers";
import { Profile } from "../../utils/types";
import styles from "./style.module.css";
import { add } from "ionicons/icons";
import { useDispatch } from "react-redux";
import { setContacts } from "../../redux/contacts/actions";

const fakeContacts: Profile[] = [
  {
    id: "test",
    username: "TestUser",
  },
];

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  contacts: Profile[];
}

const AddContactModal: React.FC<Props> = ({ isOpen, onCancel, contacts }) => {
  let indexedContacts: IndexedContacts = indexContacts(fakeContacts);
  const dispatch = useDispatch();

  const handleOnClick = (contact: Profile) => {
    const updatedContacts: Profile[] = contacts;
    updatedContacts.push(contact);

    dispatch(setContacts(updatedContacts));
  };

  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar showCancelButton="always" onIonCancel={onCancel} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className={styles["contacts-list"]}>
          {Object.keys(indexedContacts).map((char) => {
            const searchedContacts = indexedContacts[char];
            return (
              <React.Fragment key={char}>
                <IonItemDivider key={char}>
                  <IonLabel>{char}</IonLabel>
                </IonItemDivider>
                {searchedContacts.map((contact) => (
                  <IonItem lines="none" key={contact.id}>
                    <IonLabel>{contact.username}</IonLabel>
                    <IonButtons slot="end">
                      <IonButton onClick={() => handleOnClick(contact)}>
                        <IonIcon icon={add}></IonIcon>
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                ))}
              </React.Fragment>
            );
          })}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default AddContactModal;
