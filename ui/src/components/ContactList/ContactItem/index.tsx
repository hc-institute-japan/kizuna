import { IonItem } from "@ionic/react";
import React from "react";
import { useHistory } from "react-router";
import { Profile } from "../../../redux/profile/types";
import AgentIdentifier from "../../AgentIdentifier";

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
      <AgentIdentifier nickname={contact.username} id={contact.id} />
      {/* <IonButtons slot="end">
        <IonButton>
          <IonIcon icon={chatboxOutline} />
        </IonButton>
      </IonButtons> */}
    </IonItem>
  );
};

export default ContactItem;
