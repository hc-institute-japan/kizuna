import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";

const Blocked = () => {
  const history = useHistory();
  const blocked = useSelector((state: RootState) =>
    Object.values(state.contacts.blocked)
  );

  const onClick = (profile: Profile) =>
    history.push({
      pathname: `/p/${profile.username}`,
      state: {
        prev: "/blocked",
      },
    });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref="/home"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {blocked.map((block) => (
          <IonItem key={block.username} onClick={() => onClick(block)}>
            <IonLabel>{block.username}</IonLabel>
          </IonItem>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Blocked;
