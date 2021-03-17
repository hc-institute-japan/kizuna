import { IonChip, IonIcon, IonInput, IonLabel } from "@ionic/react";
import { close } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Profile, ProfileListType } from "../../redux/profile/types";
import styles from "./style.module.css";

interface Props {
  contacts: ProfileListType;
  onCloseButtonPress(contact: Profile): any;
  onSearch(search: string): any;
}

const SelectedContactsHeader: React.FC<Props> = ({
  contacts,
  onCloseButtonPress,
  onSearch,
}) => {
  const [search, setSearch] = useState("");
  const intl = useIntl();

  useEffect(() => {
    onSearch(search);
  }, [search, onSearch]);
  return (
    <div className={`${styles.recipients} ion-padding`}>
      <IonLabel className={styles.to}>
        {intl.formatMessage({ id: "app.new-conversation.to" })}:
      </IonLabel>
      {Object.values(contacts).map((contact) => (
        <IonChip color="primary" key={JSON.stringify(contact)}>
          <IonLabel className={styles["chip-label"]}>
            {contact.username}
          </IonLabel>
          <IonIcon icon={close} onClick={() => onCloseButtonPress(contact)} />
        </IonChip>
      ))}
      <IonInput
        type="text"
        placeholder={intl.formatMessage({
          id: "app.new-conversation.search-placeholder",
        })}
        onIonChange={(e) => setSearch(e.detail.value!)}
        value={search}
        debounce={500}
      ></IonInput>
    </div>
  );
};

export default SelectedContactsHeader;
