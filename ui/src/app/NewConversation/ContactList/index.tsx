import { IonList } from "@ionic/react";
import React from "react";
import { Profile } from "../../../redux/profile/types";
import { indexContacts } from "../../../utils/helpers";
import styles from "../style.module.css";
import IndexSection from "./IndexSection";

interface Props {
  contacts: Profile[];
}

const ContactList: React.FC<Props> = ({ contacts }) => {
  const indexedContacts = indexContacts(Object.values(contacts));

  return (
    <IonList className={styles["contacts-list"]}>
      {Object.keys(indexedContacts).map((char) => {
        const perCharContacts = indexedContacts[char];
        return (
          <IndexSection key={char} char={char} contacts={perCharContacts} />
        );
      })}
    </IonList>
  );
};

export default ContactList;
