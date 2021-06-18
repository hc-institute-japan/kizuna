import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { chatbox, person } from "ionicons/icons";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Redirect, Route } from "react-router";
import Contacts from "../Contacts";
import Conversations from "../Conversations";
import styles from "./style.module.css";

const HomeTabBar: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet id="home">
      <Redirect exact path="/home" to="/home/messaging"></Redirect>
      <Route
        path="/home/messaging"
        render={() => <Conversations />}
        exact={true}
      />
      <Route path="/home/contacts" render={() => <Contacts />} exact={true} />
    </IonRouterOutlet>
    <IonTabBar slot="bottom" className={styles["home-tab-bar"]}>
      <IonTabButton tab="messaging" href="/home/messaging">
        <IonIcon icon={chatbox} />
        <IonLabel>
          <FormattedMessage id="app.home.messaging-tab-bar" />
        </IonLabel>
      </IonTabButton>
      <IonTabButton tab="contacts" href="/home/contacts">
        <IonIcon icon={person} />
        <IonLabel>
          <FormattedMessage id="app.home.contacts-tab-bar" />
        </IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default HomeTabBar;
