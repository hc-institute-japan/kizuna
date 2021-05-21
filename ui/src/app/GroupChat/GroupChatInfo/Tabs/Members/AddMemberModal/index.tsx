import React, { useState } from "react";
import { IonButton, IonButtons, IonContent, IonLabel, IonList, IonModal, IonToolbar } from "@ionic/react";
import { useIntl } from "react-intl";

// redux
import { Profile, ProfileListType } from "../../../../../../redux/profile/types";
import { addGroupMembers } from "../../../../../../redux/group/actions";

// components
import EmptyContacts from "../EmptyContacts";
import AddMemberToast from "./AddMemberToast";
import AddMemberIndex from "./AddMemberIndex";
import AddMemberHeader from "./AddMemberHeader";

import { indexContacts, useAppDispatch } from "../../../../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  isOpen: boolean;
  setIsOpen: (bool: any) => void;
  setLoading: (bool: any) => void;
  onCancel: () => void;
  contacts: ProfileListType;
  groupId: string;
  groupRevisionId: string;
  myAgentId: string;
  members: Profile[];
  setMembers: (profiles: Profile[]) => void;
}

const AddContactModal: React.FC<Props> = ({ isOpen, setIsOpen, onCancel, contacts, groupId, groupRevisionId, setLoading, myAgentId, members, setMembers }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Profile[]>([]);

  const indexedContacts = indexContacts(
    Object.values(contacts).filter((contact) =>
      contact.username.toLowerCase().includes(filter.toLowerCase())
    )
  );

  const onCompletion = (contact: Profile) => {
    if (contact.id === myAgentId) {
      setToast(contact.username);
      return false;
    }
    if (members.map((profile: Profile) => {
      return profile.id
    }).includes(contact.id)) {
      setToast(contact.username);
      return false;
    }
    setSelected([...selected, contact]);
    return true
  };

  const onAdded = () => {
    setLoading(true);
    let payload = {
      // base64 string
      members: selected.map((profile: any) => profile.id),
      groupId,
      groupRevisionId,
    }
    dispatch(addGroupMembers(payload)).then((res: any) => {
      let newMembers: Profile[] = members.concat(selected);
      setMembers(newMembers);
      setIsOpen(false);
      setLoading(false);
    })
  }

  return (
    <IonModal isOpen={isOpen}>
      <AddMemberHeader
        onChange={(e) => setFilter(e.detail.value!)}
        onCancel={onCancel}
      />
      {!contacts.length ? 
        <IonContent>
          {filter.length === 0 ? 
          (
            <IonList className={styles["contacts-list"]}>
              {Object.keys(indexedContacts).map((char) => {
                const contacts = indexedContacts[char];
                return (
                  <AddMemberIndex
                  onCompletion={onCompletion}
                  key={char}
                  index={char}
                  contacts={contacts}
                />
                );
              })}
            </IonList>
          ) : (
            <IonList className={styles["contacts-list"]}>
              {Object.keys(indexedContacts).map((char) => {
                const searchedContacts = indexedContacts[char];
                return (
                  <AddMemberIndex
                    onCompletion={onCompletion}
                    key={char}
                    index={char}
                    contacts={searchedContacts}
                  />
                );
              })}
            </IonList>
          )}
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton disabled={selected.length === 0} onClick={() => onAdded()}>
                <IonLabel className={styles["add-label"]}>{intl.formatMessage({id: "app.group-chat.add-member"})}</IonLabel>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonContent> 
        : 
        <EmptyContacts/>
      }
      <AddMemberToast toast={toast} onDismiss={() => setToast(null)} />
    </IonModal>
  );
};

export default AddContactModal;
