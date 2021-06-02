import {
  IonButton,
  IonButtons,
  IonContent,
  IonLabel,
  IonList,
  IonModal,
  IonToolbar,
} from "@ionic/react";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { addGroupMembers } from "../../../../../redux/group/actions/addGroupMembers";
// redux
import { Profile, ProfileListType } from "../../../../../redux/profile/types";
import { indexContacts, useAppDispatch } from "../../../../../utils/helpers";
import AddMemberHeader from "./AddMemberHeader";
import AddMemberIndex from "./AddMemberIndex";
import AddMemberToast from "./AddMemberToast";
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

const AddMemberModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  onCancel,
  contacts,
  groupId,
  groupRevisionId,
  setLoading,
  myAgentId,
  members,
  setMembers,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Profile[]>([]);

  /* Helpers */
  const filterAddedMember = (contacts: ProfileListType) =>
    Object.keys(contacts).filter(
      (key: string) =>
        members.map((member: Profile) => member.id).indexOf(key) === -1
    );

  const indexedContacts = indexContacts(
    filterAddedMember(contacts)
      .map((key: string) => contacts[key])
      .filter((contact) =>
        contact.username.toLowerCase().includes(filter.toLowerCase())
      )
  );

  /* Handlers */

  const handleOnCompletion = (contact: Profile) => {
    /* you cannot add yourself */
    if (contact.id === myAgentId) {
      setToast(contact.username);
      return false;
    }
    /* return toast if member is already added */
    if (
      members
        .map((profile: Profile) => {
          return profile.id;
        })
        .includes(contact.id)
    ) {
      setToast(contact.username);
      return false;
    }
    setSelected([...selected, contact]);
    return true;
  };

  const handleOnAdd = () => {
    setLoading(true);
    let payload = {
      // base64 string
      members: selected.map((profile: any) => profile.id),
      groupId,
      groupRevisionId,
    };
    dispatch(addGroupMembers(payload)).then((res: any) => {
      let newMembers: Profile[] = members.concat(selected);
      setMembers(newMembers);
      setSelected([]);
      setLoading(false);
    });
  };

  /* Renders */
  const renderContacts = () =>
    Object.keys(indexedContacts).map((char) => {
      const searchedContacts = indexedContacts[char];
      return (
        <AddMemberIndex
          onCompletion={handleOnCompletion}
          key={char}
          index={char}
          contacts={searchedContacts}
        />
      );
    });

  return (
    <IonModal isOpen={isOpen}>
      <AddMemberHeader
        onChange={(e) => setFilter(e.detail.value!)}
        onCancel={onCancel}
      />
      <IonContent>
        <IonList className={styles["contacts-list"]}>
          {renderContacts()}
        </IonList>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton disabled={selected.length === 0} onClick={handleOnAdd}>
              <IonLabel className={styles["add-label"]}>
                {intl.formatMessage({ id: "app.group-chat.add-member" })}
              </IonLabel>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonContent>
      )
      <AddMemberToast toast={toast} onDismiss={() => setToast(null)} />
    </IonModal>
  );
};

export default AddMemberModal;
