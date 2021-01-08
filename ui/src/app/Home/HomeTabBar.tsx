import {
  IonIcon,
  IonLabel,

  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from "@ionic/react";
import { chatbox, person } from "ionicons/icons";
import React from "react";
import { Route, Switch } from "react-router";
import Contacts from "../Contacts";
import Conversations from "../Conversations";

const HomeTabBar = () => {

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/:tab(home)" component={Conversations} exact />
        <Route path="/:tab(home/contacts)" component={Contacts} exact />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="conversations" href="/home">
          <IonIcon icon={chatbox} />
          <IonLabel>Messaging</IonLabel>
        </IonTabButton>
        <IonTabButton tab="contacts" href="/home/contacts">
          <IonIcon icon={person} />
          <IonLabel>
            Contacts
            </IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default HomeTabBar;
