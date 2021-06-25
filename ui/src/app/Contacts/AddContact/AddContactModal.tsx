import { IonContent, IonList, IonModal } from "@ionic/react";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useToast } from "../../../containers/ToastContainer/context";
import { IndexedContacts, SET_CONTACTS } from "../../../redux/contacts/types";
import { searchProfiles } from "../../../redux/profile/actions";
import { Profile, ProfileListType } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import { indexContacts, useAppDispatch } from "../../../utils/helpers";
import styles from "../style.module.css";
import AddContactHeader from "./AddContactHeader";
import AddContactIndex from "./AddContactIndex";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  contacts: ProfileListType;
}

const AddContactModal: React.FC<Props> = ({ isOpen, onCancel }) => {
  const { showToast } = useToast();
  const intl = useIntl();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [users, setUsers] = useState<Profile[]>([]);

  const dispatch = useAppDispatch();

  const handleOnChange = (searchKey: string) => {
    console.log("searching...");
    if (searchKey.length >= 3) {
      dispatch(searchProfiles(searchKey)).then((res: Profile[]) => {
        if (res) setUsers(res);
      });
    } else if (searchKey.length > 0 && searchKey.length < 3) {
      /* add another 300ms to show warning toast */
      setTimeout(
        showToast({
          color: "warning",
          message: intl.formatMessage({
            id: "app.contacts.search-nickname-warning",
          }),
        }),
        300
      );
    } else {
      /* clear search result when string is equal to 0 */
      setUsers([]);
    }
  };

  let indexedContacts: IndexedContacts = indexContacts(users);

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
        onChange={(e) => handleOnChange(e.detail.value)}
        onCancel={onCancel}
      />
      <IonContent>
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
      </IonContent>
    </IonModal>
  );
};

export default AddContactModal;
