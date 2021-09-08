import { IonReactRouter } from "@ionic/react-router";
import { BrowserRouter } from "react-router-dom";
import React from "react";

const RouterContainer: React.FC = ({ children }) => (
  <IonReactRouter>
    <BrowserRouter>{children}</BrowserRouter>
  </IonReactRouter>
);

export default RouterContainer;
