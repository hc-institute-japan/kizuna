import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { chatbox, person } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route } from "react-router";
import { setContacts } from "../../redux/contacts/actions";
import Contacts from "../Contacts";
import Conversations from "../Conversations";
import styles from "./style.module.css";

interface TabBarItem {
  icon: string;
  label: string;
  href: string;
  tab: string;
}

const tabBar: TabBarItem[] = [
  {
    icon: chatbox,
    label: "Messaging",
    href: "/home",
    tab: "/home",
  },
  {
    icon: person,
    label: "Contacts",
    href: "/home/contacts",
    tab: "/home/contacts",
  },
];

const HomeTabBar = () => {
  const [selected, setSelected] = useState(tabBar[0].tab);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setContacts([
        {
          id: "1",
          username: "Akira Wakabayashi",
        },
        {
          id: "5",
          username: "Nicko Pangarungan",
        },
        {
          id: "3",
          username: "Chito Miranda",
        },
        {
          id: "2",
          username: "Francis Magalona",
        },
        {
          id: "4",
          username: "Gloc9 Walang Apelyido",
        },
        {
          id: "612",
          username: "Lauren Tsai",
        },
        {
          id: "1236",
          username: "Lulu Evans",
        },
        {
          id: "8512",
          username: "Kang Seulgi",
        },
      ])
    );
  }, [dispatch]);
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/:tab(home)" component={Conversations} exact />
        <Route path="/:tab(home/contacts)" component={Contacts} exact />
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
            <IonLabel>{item.label}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
};

export default HomeTabBar;
