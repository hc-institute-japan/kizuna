import { IonContent, IonLoading, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import MessageInput from "../../components/MessageInput";
import { useToast } from "../../containers/ToastContainer/context";
import { FilePayloadInput } from "../../redux/commons/types";
import { sendInitialGroupMessage } from "../../redux/group/actions";
import { GroupConversation } from "../../redux/group/types";
import { saveMessage } from "../../redux/p2pmessages/actions/saveMessage";
import { sendMessage2 } from "../../redux/p2pmessages/actions/sendMessage2";
import { receiveReceipt } from "../../redux/p2pmessages/actions/receiveReceipt";
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
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation<StateProps>();
  const { showErrorToast } = useToast();

  /* Local States */
  const [contacts, setContacts] = useState<ProfileListType>({});
  const [selectedContacts, setSelectedContacts] = useState<ProfileListType>({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<object[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Handlers */
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

  const handleOnSend = () => {
    const contacts = Object.values(selectedContacts);
    const receiverID = contacts[0].id;

    if (contacts.length === 1) {
      if (message !== "") {
        setIsLoading(true);
        dispatch(saveMessage(receiverID, message, "TEXT", undefined)).then(
          (rawTimestamp: [number, number]) =>
            dispatch(
              sendMessage2(receiverID, message, "TEXT", rawTimestamp, undefined)
            ).then((receipt: any) =>
              dispatch(receiveReceipt(receipt)).then((res: boolean) => {
                if (files.length <= 0 && res === true) {
                  setIsLoading(false);
                  history.push({
                    pathname: `/u/${contacts[0].id}`,
                    state: { username: contacts[0].username },
                  });
                }
              })
            )
        );
      }

      files.forEach((file) => {
        setIsLoading(true);
        setTimeout(
          dispatch(
            saveMessage(receiverID, message, "FILE", undefined, file)
          ).then((rawTimestamp: [number, number]) =>
            dispatch(
              sendMessage2(
                receiverID,
                message,
                "FILE",
                rawTimestamp,
                undefined,
                file
              )
            )
              .then((receipt: any) => dispatch(receiveReceipt(receipt)))
              .then((res: boolean) => {
                setIsLoading(false);
                if (res === true) history.push(`/u/${contacts[0].id}`);
              })
          ),
          3000
        );
      });

      // setIsLoading(false);
    } else if (contacts.length > 1) {
      /* create a Group and send the initial message */
      setIsLoading(true);
      let fileInputs: FilePayloadInput[] = files.map((file: any) => {
        let filePayloadInput: FilePayloadInput = {
          type: "FILE",
          payload: {
            metadata: {
              fileName: file.metadata.fileName,
              fileSize: file.metadata.fileSize,
              fileType: file.metadata.fileType,
            },
            fileType: file.fileType,
            fileBytes: file.fileBytes,
          },
        };
        return filePayloadInput;
      });
      dispatch(sendInitialGroupMessage(contacts, message, fileInputs)).then(
        (
          res: { groupResult: GroupConversation; messageResults: any[] } | false
        ) => {
          setIsLoading(false);
          if (res !== false) {
            history.push(`/g/${res.groupResult.originalGroupId}`);
          }
        }
      );
    } else {
      showErrorToast({
        message: intl.formatMessage({
          id: "app.new-conversation.no-contacts-toast",
        }),
      });
    }
  };

  /* Effects */
  useEffect(() => {
    setSearch("");
  }, [contacts, selectedContacts]);

  useEffect(() => {
    if (location.state !== undefined) setContacts(location.state.contacts);
    return () => setContacts({});
  }, [location.state]);

  return (
    <ContactsContext.Provider
      value={[contacts, setContacts, selectedContacts, setSelectedContacts]}
    >
      <IonPage>
        <IonLoading isOpen={isLoading} />
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
