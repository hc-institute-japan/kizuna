import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import React, { useEffect } from "react";
import { Redirect, Route } from "react-router";
import Menu from "../../components/Menu";
import { fetchMyContacts } from "../../redux/contacts/actions";
import { fetchPreference } from "../../redux/preference/actions";
import { useAppDispatch } from "../../utils/helpers";
import Chat from "../Chat";
import NewConversation from "../NewConversation";
import Settings from "../Settings";
import HomeTabBar from "./HomeTabBar";
import GroupChat from "../GroupChat";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(
    function () {
      dispatch(fetchPreference());
      dispatch(fetchMyContacts());
    },
    [dispatch]
  );
  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main">
        <Route path="/home" component={HomeTabBar} />
        <Route path="/compose" exact component={NewConversation} />
        <Route path="/u/:username" exact component={Chat} />
        <Route path="/settings" exact component={Settings} />
        <Route path="/test" exact component={GroupChat} />
        <Redirect from="/" to="/home" exact />
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default Home;
