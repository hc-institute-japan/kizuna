import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { Route } from "react-router";
import GroupChatDetails from "../GroupChat/GroupChatDetails";
import ChatContent from "./ChatContent";
import ChatDetails from "./ChatDetails";
const Chat: React.FC = () => {
  return (
    <IonReactRouter>
      <Route path="/u/:username" exact>
        <ChatContent />
      </Route>
      <Route path="/u/:username/details" exact component={GroupChatDetails} />
    </IonReactRouter>
  );
};

export default Chat;
