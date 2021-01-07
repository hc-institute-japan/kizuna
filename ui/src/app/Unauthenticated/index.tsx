import { IonRouterOutlet } from "@ionic/react";
import React from "react";
import { Route } from "react-router";
import Landing from "../Landing";
import Login from "../Login";
import Register from "../Register";

const Unauthenticated: React.FC = () => (
  <IonRouterOutlet>
    <Route path="/" component={Landing} />
    <Route path="/register" component={Register} />
    <Route path="/login" component={Login} />
  </IonRouterOutlet>
);

export default Unauthenticated;
