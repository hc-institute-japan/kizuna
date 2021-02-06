import { useQuery } from "@apollo/client";
import { IonContent, IonList, IonModal } from "@ionic/react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ALL from "../../../graphql/contacts/queries/all";
import { setContacts } from "../../../redux/contacts/actions";
import { IndexedContacts } from "../../../redux/contacts/types";
import { Profile } from "../../../redux/profile/types";
import { indexContacts } from "../../../utils/helpers";
import styles from "../style.module.css";
import AddContactHeader from "./AddContactHeader";
import AddContactIndex from "./AddContactIndex";
import AddContactToast from "./AddContactToast";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  contacts: Profile[];
}

const AddContactModal: React.FC<Props> = ({ isOpen, onCancel, contacts }) => {
  const [filter, setFilter] = useState<string>("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const dispatch = useDispatch();

  useQuery(ALL, {
    onCompleted: (data) => {
      const { all = [] } = { ...data };
      setUsers(
        all.filter(
          (user: Profile) =>
            !contacts.find((toRemove) => toRemove.username === user.username)
        )
      );
    },
  });

  let indexedContacts: IndexedContacts = indexContacts(
    users.filter((user) => user.username.includes(filter))
  );

  const onCompletion = (contact: Profile) => {
    const updatedContacts: Profile[] = contacts;
    updatedContacts.push(contact);
    setToast(contact.username);
    setUsers((users) =>
      users.filter((user) => contact.username !== user.username)
    );
    dispatch(setContacts(updatedContacts));
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
