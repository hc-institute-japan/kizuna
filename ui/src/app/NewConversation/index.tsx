import {
  IonBackButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import MessageInput from "../../components/MessageInput";
import { Profile, ProfileListType } from "../../redux/profile/types";
import ContactList from "./ContactList";
import { ContactsContext } from "./context";
import styles from "./style.module.css";

interface StateProps {
  contacts: ProfileListType;
}

const NewConversation: React.FC = () => {
  const location = useLocation<StateProps>();
  const [contacts, setContacts] = useState<ProfileListType>({});
  const [selectedContacts, setSelectedContacts] = useState<ProfileListType>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (location.state !== undefined) setContacts(location.state.contacts);
    return () => setContacts({});
  }, [location.state]);
  const handleOnClose = (contact: Profile) => {
    setSelectedContacts((currContacts) => {
      delete currContacts[JSON.stringify(contact.id)];
      return { ...currContacts };
    });
    setContacts((currContacts) => {
      currContacts[JSON.stringify(contact.id)] = contact;
      return currContacts;
    });
  };

  useEffect(() => {
    setSearch("");
  }, [contacts, selectedContacts]);

  return (
    <ContactsContext.Provider
      value={[contacts, setContacts, selectedContacts, setSelectedContacts]}
    >
      <IonPage>
        <IonHeader className={styles.header}>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>New Message</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className={styles["list"]}>
          <div className={`${styles.recipients} ion-padding`}>
            <IonLabel className={styles.to}>To:</IonLabel>
            {Object.values(selectedContacts).map((selectedContact) => (
              <IonChip color="primary" key={JSON.stringify(selectedContact.id)}>
                <IonLabel className={styles["chip-label"]}>
                  {selectedContact.username}
                </IonLabel>
                <IonIcon
                  icon={close}
                  onClick={() => handleOnClose(selectedContact)}
                />
              </IonChip>
            ))}
            <IonInput
              type="text"
              placeholder="search contacts..."
              onIonChange={(e) => setSearch(e.detail.value!)}
              value={search}
              debounce={500}
            ></IonInput>
          </div>
          <ContactList
            contacts={Object.values(contacts).filter((a) =>
              a.username.includes(search)
            )}
          />
        </IonContent>

        <MessageInput onChange={(message) => {}}></MessageInput>
      </IonPage>
    </ContactsContext.Provider>
  );
};

export default NewConversation;
