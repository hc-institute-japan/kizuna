import { IonButton, IonButtons, IonIcon, IonItem } from "@ionic/react";
import { chatboxOutline, informationCircleOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { Profile } from "../../../redux/profile/types";
import AgentIdentifier from "../../AgentIdentifier";

interface Props {
  contact: Profile;
  displayMsgBtn?: boolean;
}

const ContactItem: React.FC<Props> = ({ contact, displayMsgBtn = false }) => {
  const history = useHistory();
  const handleOnInfoBtnClick = () =>
    history.push({
      pathname: `/p/${contact.id}`,
      state: { profile: contact },
    });

  const handleOnMsgBtnClick = () => {
    history.push({
      pathname: `/u/${contact.id}`,
      state: { username: contact.username },
    });
  };

  return (
    <IonItem key={JSON.stringify(contact)}>
      <AgentIdentifier
        displayAvatar={true}
        avatar={contact.fields.avatar}
        nickname={contact.username}
        id={contact.id}
      />
      <IonButtons slot="end">
        {displayMsgBtn ? (
          <IonButton onClick={handleOnMsgBtnClick}>
            <IonIcon icon={chatboxOutline} />
          </IonButton>
        ) : null}
        <IonButton onClick={handleOnInfoBtnClick}>
          <IonIcon icon={informationCircleOutline} />
        </IonButton>
      </IonButtons>
    </IonItem>
  );
};

export default ContactItem;
