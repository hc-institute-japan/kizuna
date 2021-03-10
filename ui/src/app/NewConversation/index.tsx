import {
  IonBackButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import MessageInput from "../../components/MessageInput";
// import { sendInitialGroupMessage } from "../../redux/groupConversations/actions";
import { Profile, ProfileListType } from "../../redux/profile/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
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
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();

  useEffect(() => {
    if (location.state !== undefined) setContacts(location.state.contacts);
    return () => setContacts({});
  }, [location.state]);
  const handleOnClose = (contact: Profile) => {
    setSelectedContacts((currContacts) => {
      delete currContacts[Uint8ArrayToBase64(contact.id)];
      return { ...currContacts };
    });
    setContacts((currContacts) => {
      currContacts[Uint8ArrayToBase64(contact.id)] = contact;
      return currContacts;
    });
  };

  useEffect(() => {
    setSearch("");
  }, [contacts, selectedContacts]);
  useEffect(() => {
    setIsOpen(error !== undefined);
  }, [error]);

  const handleOnSend = () => {
    const contacts = Object.values(selectedContacts);
    if (contacts.length === 1) {
      // send p2p
    } else if (contacts.length > 1) {
      // setIsLoading(true);
      // dispatch(sendInitialGroupMessage(contacts, message)).then((res: any) => {
      //   if (res) {
      //     setIsLoading(false);
      //     const base64 = Uint8ArrayToBase64(res.versions[0].groupEntryHash);

      //     history.push(`/g/${base64}`);
      //   } else {
      //     setIsLoading(false);
      //     setError(
      //       intl.formatMessage({
      //         id: "app.new-conversation.problem-occured-toast",
      //       })
      //     );
      //   }
      // });
    } else {
      setError(
        intl.formatMessage({ id: "app.new-conversation.no-contacts-toast" })
      );
    }
  };

  return (
    <ContactsContext.Provider
      value={[contacts, setContacts, selectedContacts, setSelectedContacts]}
    >
      <IonPage>
        <IonToast
          isOpen={isOpen}
          onDidDismiss={() => setError(undefined)}
          duration={1500}
          message={error}
          color="danger"
        ></IonToast>
        <IonHeader className={styles.header}>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>
              {intl.formatMessage({ id: "app.new-conversation.header-title" })}
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonLoading isOpen={isLoading} />

        <IonContent className={styles["list"]}>
          <div className={`${styles.recipients} ion-padding`}>
            <IonLabel className={styles.to}>
              {intl.formatMessage({ id: "app.new-conversation.to" })}:
            </IonLabel>
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
              placeholder={intl.formatMessage({
                id: "app.new-conversation.search-placeholder",
              })}
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

        <MessageInput
          onSend={handleOnSend}
          onChange={(message) => setMessage(message)}
        />
      </IonPage>
    </ContactsContext.Provider>
  );
};

export default NewConversation;
