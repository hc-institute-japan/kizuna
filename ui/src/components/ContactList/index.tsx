import { IonList } from "@ionic/react";
import React from "react";
import { Profile } from "../../redux/profile/types";
import IndexSection from "./IndexSection";
import styles from "./style.module.css";

interface Props {
  contacts: {
    [key: string]: Profile[];
  };
  displayMsgBtn?: boolean;
}

const ContactsList: React.FC<Props> = ({
  contacts: indexedContacts,
  displayMsgBtn = false,
}) => (
  <IonList className={styles["contacts-list"]}>
    {Object.keys(indexedContacts).map((char) => {
      const contacts = indexedContacts[char];
      return (
        <IndexSection
          displayMsgBtn={displayMsgBtn}
          key={char}
          char={char}
          contacts={contacts}
        ></IndexSection>
      );
    })}
  </IonList>
);

export default ContactsList;
