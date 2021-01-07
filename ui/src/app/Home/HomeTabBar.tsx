import {
  IonContent,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { call, person, settings } from "ionicons/icons";
import React from "react";
import { Redirect, Route } from "react-router";
import Contacts from "../Contacts";
import Conversations from "../Conversations";

const HomeTabBar = () => {
  return (
    <IonPage>
      <IonContent>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/home/conversations" component={Conversations} exact />
            <Route path="/home/contacts" component={Contacts} exact />
            <Redirect from="/home" to="/home/conversations" />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="conversations" href="/conversations">
              <IonIcon icon={call} />
            </IonTabButton>
            <IonTabButton tab="contacts" href="/contacts">
              <IonIcon icon={person} />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonContent>
    </IonPage>
  );
};

export default HomeTabBar;
