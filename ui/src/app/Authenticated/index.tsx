import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { Switch, Redirect, Route } from "react-router";

import Menu from "../../components/Menu";
import Spinner from "../../components/Spinner";
import { getLatestData } from "../../redux/commons/actions";
import { useAppDispatch } from "../../utils/services/ReduxService";
import Blocked from "../Blocked";
import Chat from "../Chat";
import GroupChat from "../GroupChat";
import Home from "../Home";
import NewConversation from "../NewConversation";
import Profile from "../Profile";
import Settings from "../Settings";

const RedeclaredSwitch = Switch as any;
const RedeclaredRoute = Route as any;
const RedeclaredRedirect = Redirect as any;

const Authenticated: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getLatestData()).then((res: any) => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !loading ? (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main">
        <RedeclaredSwitch>
          <RedeclaredRoute path="/home" render={() => <Home />} />
          <RedeclaredRoute path="/compose" exact component={NewConversation} />
          <RedeclaredRoute path="/settings" exact component={Settings} />
          <RedeclaredRoute path="/g/:group" component={GroupChat} />
          <RedeclaredRoute path="/u/:id" component={Chat} />

          <RedeclaredRoute path="/p/:id" exact component={Profile} />
          {/* <Route path="/test" exact component={GroupChat} /> */}

          <RedeclaredRoute path="/blocked" exact component={Blocked} />

          <RedeclaredRedirect from="/" to="/home" />
        </RedeclaredSwitch>
      </IonRouterOutlet>
    </IonSplitPane>
  ) : (
    <Spinner />
  );
};

export default Authenticated;
