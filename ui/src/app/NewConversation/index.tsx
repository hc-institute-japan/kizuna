import { IonContent, IonLoading, IonPage, IonToast } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import MessageInput from "../../components/MessageInput";
import { FilePayloadInput } from "../../redux/commons/types";
import { sendInitialGroupMessage } from "../../redux/group/actions";
import { Profile, ProfileListType } from "../../redux/profile/types";
import { useAppDispatch } from "../../utils/helpers";
import ContactList from "./ContactList";
import { ContactsContext } from "./context";
import NewConversationHeader from "./NewConversationHeader";
import SelectedContactsHeader from "./SelectedContactsHeader";
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
  const [files, setFiles] = useState<object[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();

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
      return { ...currContacts };
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
      // create a Group and send the initial message
      setIsLoading(true);
      let fileInputs: FilePayloadInput[] = files.map((file: any) => {
        let filePayloadInput: FilePayloadInput = {
          type: "FILE",
          payload: {
            metadata: {
              fileName: file.metadata.fileName,
              fileSize:file.metadata.fileSize,
              fileType: file.metadata.fileType,
            },
            fileType: file.fileType,
            fileBytes: file.fileBytes,
          }
        }
        return filePayloadInput
      });
      dispatch(sendInitialGroupMessage(contacts, message, fileInputs)).then((res: any) => {
        if (res) {
          setIsLoading(false);
          history.push(`/g/${res.groupResult.originalGroupEntryHash}`);
        } else {
          setIsLoading(false);
          setError(
            intl.formatMessage({
              id: "app.new-conversation.problem-occured-toast",
            })
          );
        }
      });
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
          onFileSelect={(files) => setFiles(files)}
        />
      </IonPage>
    </ContactsContext.Provider>
  );
};

export default NewConversation;
