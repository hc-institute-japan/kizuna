import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { Route } from "react-router";
import Landing from "../Landing";
import Login from "../Login";
import Register from "../Register";

const RedeclaredRoute = Route as any;

const Unauthenticated: React.FC = () => (
  <IonReactRouter>
    <RedeclaredRoute path="/" component={Landing} />
    <RedeclaredRoute path="/register" component={Register} />
    <RedeclaredRoute path="/login" component={Login} />
  </IonReactRouter>
);

export default Unauthenticated;
