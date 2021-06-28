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

interface Props {
  onChange: (e: CustomEvent) => void;
  noSearch?: boolean;
}

const Toolbar: React.FC<Props> = ({ onChange, noSearch }) => {
  const [isSearching, setIsSearching] = useState(false);
  return (
    <IonHeader>
      <IonToolbar>
        {isSearching ? (
          <IonSearchbar
            onIonChange={(e) => onChange(e)}
            showCancelButton="always"
            debounce={500}
            onIonCancel={() => setIsSearching(false)}
          />
        ) : (
          <>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            {!noSearch ? (
              <IonButtons slot="end">
                <IonButton onClick={() => setIsSearching(true)}>
                  <IonIcon icon={search} slot="icon-only" />
                </IonButton>
              </IonButtons>
            ) : null}
          </>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default Toolbar;
