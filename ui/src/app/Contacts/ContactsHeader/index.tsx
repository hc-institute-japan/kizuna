import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { search } from "ionicons/icons";
import React, { useState } from "react";

const ContactsHeader = () => {
  const [isSearching, setIsSearching] = useState(false);
  return (
    <IonHeader>
      <IonToolbar>
        {isSearching ? (
          <IonSearchbar
            showCancelButton="always"
            onIonCancel={() => setIsSearching(false)}
          />
        ) : (
          <>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsSearching(true)}>
                <IonIcon icon={search} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default ContactsHeader;
