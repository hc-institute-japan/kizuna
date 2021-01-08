import { IonItem, IonItemDivider, IonLabel, IonList } from "@ionic/react";
import React from "react";
import { Profile } from "../../utils/types";
import styles from "./style.module.css";

interface Props {
  contacts: {
    [key: string]: Profile[];
  };
}

const ContactsList: React.FC<Props> = ({ contacts: indexedContacts }) => {
  return (
    <IonList className={styles["contacts-list"]}>
      {Object.keys(indexedContacts).map((char) => {
        const contacts = indexedContacts[char];
        return (
          <React.Fragment key={char}>
            <IonItemDivider>
              <IonLabel>{char}</IonLabel>
            </IonItemDivider>
            {contacts.map((contact) => (
              <IonItem lines="none" key={contact.id}>
                <IonLabel>{contact.username}</IonLabel>
              </IonItem>
            ))}
          </React.Fragment>
        );
      })}
    </IonList>
  );
};

export default ContactsList;
