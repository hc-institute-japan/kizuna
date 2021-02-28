import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { chatbox, person } from "ionicons/icons";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Route, RouteComponentProps } from "react-router";
import Contacts from "../Contacts";
import Conversations from "../Conversations";
import styles from "./style.module.css";

interface TabBarItem {
  icon: string;
  labelId: string;
  href: string;
  tab: string;
}

const tabBar: TabBarItem[] = [
  {
    icon: chatbox,
    labelId: "app.home.messaging-tab-bar",
    href: "/home",
    tab: "/home",
  },
  {
    icon: person,
    labelId: "app.home.contacts-tab-bar",
    href: "/home/contacts",
    tab: "/home/contacts",
  },
];

const HomeTabBar: React.FC<RouteComponentProps> = ({ match }) => {
  const [selected, setSelected] = useState(tabBar[0].tab);
  const url = match.url.substring(1);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path={`/:tab(home)`} component={Conversations} exact />
        <Route path={`/:tab(${url}/contacts)`} component={Contacts} exact />
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className={styles["home-tab-bar"]}>
        {tabBar.map((item) => (
          <IonTabButton
            key={item.tab}
            selected={item.tab === selected}
            tab={item.tab}
            onClick={() => setSelected(item.tab)}
            href={item.href}
          >
            <IonIcon icon={item.icon} />
            <IonLabel>
              <FormattedMessage id={item.labelId} />
            </IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
};

export default HomeTabBar;
