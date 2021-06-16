import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { Route } from "react-router";
import GroupChatContent from "./GroupChatContent";
import GroupChatDetails from "./GroupChatDetails";

const GroupChat: React.FC = () => {
  return (
    <IonReactRouter>
      <Route path="/g/:group" exact>
        <GroupChatContent />
      </Route>
      <Route path="/g/:group/details" exact>
        <GroupChatDetails />
      </Route>
    </IonReactRouter>
  );
};

export default GroupChat;
