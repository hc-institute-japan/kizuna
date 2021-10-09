import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
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
      pathname: `/p/${profile.id}`,
      state: {
        profile,
        prev: "/blocked",
      },
    });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              onClick={() => history.push({ pathname: `/home` })}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {blocked.map((block) => (
          <IonItem button key={block.username} onClick={() => onClick(block)}>
            <IonLabel>{block.username}</IonLabel>
          </IonItem>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Blocked;
