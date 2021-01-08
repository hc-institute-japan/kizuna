import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import React from "react";
import { Redirect, Route } from "react-router";
import Menu from "../../components/Menu";
import HomeTabBar from "./HomeTabBar";

const Home: React.FC = () => (
  <IonSplitPane contentId="main">
    <Menu />
    <IonRouterOutlet id="main">
      <Route path="/home" component={HomeTabBar} />
      <Redirect from='/' to='/home' exact />
    </IonRouterOutlet>
  </IonSplitPane>
);

export default Home;
