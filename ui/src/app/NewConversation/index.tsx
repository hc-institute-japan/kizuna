import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLoading,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";
import MessageInput from "../../components/MessageInput";
// import { sendInitialGroupMessage } from "../../redux/groupConversations/actions";
import { Profile, ProfileListType } from "../../redux/profile/types";
import ContactList from "./ContactList";
import SelectedContactsHeader from "./SelectedContactsHeader";
import { ContactsContext } from "./context";
import styles from "./style.module.css";
import NewConversationHeader from "./NewConversationHeader";

interface StateProps {
  contacts: ProfileListType;
}

const NewConversation: React.FC = () => {
  const location = useLocation<StateProps>();
  const [contacts, setContacts] = useState<ProfileListType>({});
  const [selectedContacts, setSelectedContacts] = useState<ProfileListType>({});
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [_message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading] = useState(false);
  // const dispatch = useAppDispatch();
  const intl = useIntl();
  // const history = useHistory();

  useEffect(() => {
    if (location.state !== undefined) setContacts(location.state.contacts);
    return () => setContacts({});
  }, [location.state]);
  const handleOnRemove = (contact: Profile) => {
    setSelectedContacts((currContacts) => {
      delete currContacts[contact.id];
      return { ...currContacts };
    });
    setContacts((currContacts) => {
      currContacts[contact.id] = contact;
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
        <IonLoading isOpen={isLoading} />
        <IonToast
          isOpen={isOpen}
          onDidDismiss={() => setError(undefined)}
          duration={1500}
          message={error}
          color="danger"
        />
        <NewConversationHeader />

        <IonContent className={styles["list"]}>
          <SelectedContactsHeader
            contacts={selectedContacts}
            onCloseButtonPress={handleOnRemove}
            onSearch={setSearch}
          />
          <ContactList
            contacts={Object.values(contacts).filter((a) =>
              a.username.includes(search)
            )}
          />
        </IonContent>
        <MessageInput
          onSend={handleOnSend}
          onChange={(message) => setMessage(message)}
          onFileSelect={(files) => console.log(files)}
        />
      </IonPage>
    </ContactsContext.Provider>
  );
};

export default NewConversation;