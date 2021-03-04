import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { chatboxOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { Profile } from "../../redux/profile/types";

interface Props {
  contact: Profile;
}

const ContactItem: React.FC<Props> = ({ contact }) => {
  const history = useHistory();
  const handleOnClick = () =>
    history.push({
      pathname: `/p/${contact.username}`,
      state: { contact },
    });

  return (
    <IonItem onClick={handleOnClick} lines="none" key={JSON.stringify(contact)}>
      <IonLabel>{contact.username}</IonLabel>
      <IonButtons slot="end">
        <IonButton>
          <IonIcon icon={chatboxOutline} />
        </IonButton>
      </IonButtons>
    </IonItem>
  );
};

export default ContactItem;
