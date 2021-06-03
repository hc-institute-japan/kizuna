import { IonContent, IonList, IonModal } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useToast } from "../../../containers/ToastContainer/context";
import { fetchAllUsernames } from "../../../redux/contacts/actions";
import { IndexedContacts, SET_CONTACTS } from "../../../redux/contacts/types";
import { Profile, ProfileListType } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
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
  const { showToast } = useToast();
  const { contacts, username } = useSelector((state: RootState) => ({
    contacts: state.contacts.contacts,
    username: state.profile.username,
  }));

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllUsernames()).then((res: any) => {
      if (res) {
        const filteredRes = res.filter(
          (user: Profile) => username !== user.username
        );
        setUsers(filteredRes);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  let indexedContacts: IndexedContacts = indexContacts(
    users.filter((user) => user.username.includes(filter))
  );

  const intl = useIntl();
  const onCompletion = (contact: Profile) => {
    showToast({
      message: intl.formatMessage(
        { id: "app.contacts.add-message" },
        { name: contact.username }
      ),
      color: "light",
      duration: 1000,
    });
    dispatch({
      type: SET_CONTACTS,
      contacts: { ...contacts },
    });
    setUsers((users) =>
      users.filter((user) => user.username !== contact.username)
    );
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onCancel}>
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
      </IonContent>
    </IonModal>
  );
};

export default AddContactModal;
