import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { Route } from "react-router";
import Landing from "../Landing";
import Login from "../Login";
import Register from "../Register";

const Unauthenticated: React.FC = () => (
  <IonReactRouter>
    <Route path="/" component={Landing} />
    <Route path="/register" component={Register} />
    <Route path="/login" component={Login} />
  </IonReactRouter>
);

export default Unauthenticated;
