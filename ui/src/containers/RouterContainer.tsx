import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { BrowserRouter } from "react-router-dom";

const RouterContainer: React.FC = ({ children }) => (
  <IonReactRouter>
    {/* <BrowserRouter> */}
    {children}
    {/* </BrowserRouter> */}
  </IonReactRouter>
);

export default RouterContainer;
