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
import { useToast } from "../../../../../containers/ToastContainer/context";

import { addMembers } from "../../../../../redux/group/actions/addMembers";
import { UpdateGroupMembersData } from "../../../../../redux/group/types";
// redux
import { Profile, ProfileListType } from "../../../../../redux/profile/types";
import { indexContacts, useAppDispatch } from "../../../../../utils/helpers";
import AddMemberHeader from "./AddMemberHeader";
import AddMemberIndex from "./AddMemberIndex";
import styles from "./style.module.css";

interface Props {
  isOpen: boolean;
  setLoading: (bool: any) => void;
  onCancel: () => void;
  contacts: ProfileListType;
  groupId: string;
  groupRevisionId: string;
  members: Profile[];
  setMembers: (profiles: Profile[]) => void;
}

const AddMemberModal: React.FC<Props> = ({
  isOpen,
  onCancel,
  contacts,
  groupId,
  groupRevisionId,
  setLoading,
  members,
  setMembers,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showErrorToast } = useToast();
  const [filter, setFilter] = useState<string>("");
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
  const handleOnSelected = (contact: Profile) =>
    setSelected([...selected, contact]);

  const handleOnAdd = () => {
    setLoading(true);
    let payload = {
      members: selected.map((profile: any) => profile.id), // base64 string
      groupId,
      groupRevisionId,
    };
    dispatch(addMembers(payload)).then(
      (res: UpdateGroupMembersData | boolean) => {
        if (res !== false) {
          let newMembers: Profile[] = members.concat(selected);
          setMembers(newMembers);
          setSelected([]);
          setLoading(false);
        } else {
          setSelected([]);
          setLoading(false);
        }
      }
    );
  };

  /* Renders */
  const renderContacts = () =>
    Object.keys(indexedContacts).map((char) => {
      const searchedContacts = indexedContacts[char];
      return (
        <AddMemberIndex
          onSelected={handleOnSelected}
          key={char}
          index={char}
          contacts={searchedContacts}
          selected={selected}
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
    </IonModal>
  );
};

export default AddMemberModal;
