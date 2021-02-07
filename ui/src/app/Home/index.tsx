import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import React from "react";
import { Redirect, Route } from "react-router";
import Menu from "../../components/Menu";
import Chat from "../Chat";
import Settings from "../Settings";
import HomeTabBar from "./HomeTabBar";

const Home: React.FC = () => (
  <IonSplitPane contentId="main">
    <Menu />
    <IonRouterOutlet id="main">
      <Route path="/home" component={HomeTabBar} />

      <Route path="/u/:username" component={Chat} />
      <Route path="/settings" component={Settings} />

      <Redirect from="/" to="/home" exact />
    </IonRouterOutlet>
  </IonSplitPane>
);

export default Home;
