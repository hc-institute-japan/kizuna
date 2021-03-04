import { IonContent, IonList, IonModal } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { fetchAllUsernames } from "../../../redux/contacts/actions";
import { IndexedContacts } from "../../../redux/contacts/types";
import { Profile, ProfileListType } from "../../../redux/profile/types";
import { indexContacts, useAppDispatch } from "../../../utils/helpers";
import styles from "../style.module.css";
import AddContactHeader from "./AddContactHeader";
import AddContactIndex from "./AddContactIndex";
import AddContactToast from "./AddContactToast";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  contacts: ProfileListType;
}

const AddContactModal: React.FC<Props> = ({ isOpen, onCancel }) => {
  const [filter, setFilter] = useState<string>("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllUsernames()).then((res: any) => {
      if (res) setUsers(res);
    });
  }, [dispatch]);

  let indexedContacts: IndexedContacts = indexContacts(
    users.filter((user) => user.username.includes(filter))
  );

  const onCompletion = (contact: Profile) => {
    setToast(contact.username);
    setUsers((users) =>
      users.filter((user) => user.username !== contact.username)
    );
  };

  return (
    <IonModal isOpen={isOpen}>
      <AddContactHeader
        onChange={(e) => setFilter(e.detail.value!)}
        onCancel={onCancel}
      />
      <IonContent>
        {filter.length === 0 ? null : (
          <IonList className={styles["contacts-list"]}>
            {Object.keys(indexedContacts).map((char) => {
              const searchedContacts = indexedContacts[char];
              return (
                <AddContactIndex
                  onCompletion={onCompletion}
                  key={char}
                  index={char}
                  contacts={searchedContacts}
                />
              );
            })}
          </IonList>
        )}
        <AddContactToast toast={toast} onDismiss={() => setToast(null)} />
      </IonContent>
    </IonModal>
  );
};

export default AddContactModal;
