import { IonReactRouter } from "@ionic/react-router";
import React from "react";

const RouterContainer: React.FC = ({ children }) => (
  <IonReactRouter>{children}</IonReactRouter>
);

export default RouterContainer;
