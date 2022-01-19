import {
  IonContent,
  IonIcon,
  IonLoading,
  IonPage,
  IonText,
} from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import MessageInput, {
  FileContent,
  MessageInputOnSendParams,
} from "../../components/MessageInput";
import { useToast } from "../../containers/ToastContainer/context";
import { FilePayloadInput } from "../../redux/commons/types";
import { sendInitialGroupMessage } from "../../redux/group/actions";
import { GroupConversation } from "../../redux/group/types";
import { sendMessage } from "../../redux/p2pmessages/actions/sendMessage";
import { setErrorMessage } from "../../redux/p2pmessages/actions/setErrMessage";
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
  const [files, setFiles] = useState<FileContent[]>([]);
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

  const handleOnSend = (opt?: MessageInputOnSendParams) => {
    const contacts = Object.values(selectedContacts);
    let { message: message2 } = { ...opt };

    if (contacts.length === 1) {
      if (message2 && message2 !== "") {
        setIsLoading(true);
        dispatch(sendMessage(contacts[0].id, message2, "TEXT", undefined)).then(
          (res: boolean) => {
            if (!res && files.length <= 0) {
              setIsLoading(false);
              dispatch(
                setErrorMessage(contacts[0].id, message, "TEXT", undefined)
              );
              history.push({
                pathname: `/u/${contacts[0].id}`,
                state: { username: contacts[0].username },
              });
            } else if (!res) {
              dispatch(
                setErrorMessage(contacts[0].id, message, "TEXT", undefined)
              );
            }
            if (files.length <= 0 && res === true) {
              setIsLoading(false);
              history.push({
                pathname: `/u/${contacts[0].id}`,
                state: { username: contacts[0].username },
              });
            } else if (files.length) {
              files.forEach((file) => {
                dispatch(
                  sendMessage(contacts[0].id, message, "FILE", undefined, file)
                ).then((res: boolean) => {
                  if (res === true) {
                    setIsLoading(false);
                    history.push({
                      pathname: `/u/${contacts[0].id}`,
                      state: { username: contacts[0].username },
                    });
                  } else {
                    dispatch(
                      setErrorMessage(
                        contacts[0].id,
                        message,
                        "FILE",
                        undefined,
                        file
                      )
                    );
                    setIsLoading(false);
                    history.push({
                      pathname: `/u/${contacts[0].id}`,
                      state: { username: contacts[0].username },
                    });
                  }
                });
              });
            }
          }
        );
      }

      if (message === "" && files.length) {
        files.forEach((file) => {
          setIsLoading(true);
          dispatch(
            sendMessage(contacts[0].id, message, "FILE", undefined, file)
          ).then((res: boolean) => {
            setIsLoading(false);
            if (res === true) {
              history.push({
                pathname: `/u/${contacts[0].id}`,
                state: { username: contacts[0].username },
              });
            } else {
              dispatch(
                setErrorMessage(
                  contacts[0].id,
                  message,
                  "FILE",
                  undefined,
                  file
                )
              );
              setIsLoading(false);
              history.push({
                pathname: `/u/${contacts[0].id}`,
                state: { username: contacts[0].username },
              });
            }
          });
        });
      }
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
      dispatch(
        sendInitialGroupMessage(
          contacts,
          message2 ? message2 : message,
          fileInputs
        )
      ).then(
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

  const renderP2PWarning = () => {
    return (
      <div className={styles["warning"]}>
        <IonIcon
          icon={warningOutline}
          color="warning"
          className={styles["warning-icon"]}
        />
        <IonText color="warning">
          Currently, p2p message only gets sent when the receiver is online
        </IonText>
      </div>
    );
  };

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
        {Object.values(selectedContacts).length === 1
          ? renderP2PWarning()
          : null}
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
