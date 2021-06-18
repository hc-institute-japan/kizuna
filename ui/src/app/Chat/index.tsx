import React from "react";
import { Route, Switch } from "react-router";
import GroupChatDetails from "../GroupChat/GroupChatDetails";
import ChatContent from "./ChatContent";
const Chat: React.FC = () => {
  return (
    <Switch>
      <Route path="/u/:username" exact>
        <ChatContent />
      </Route>
      <Route path="/u/:username/details" exact component={GroupChatDetails} />
    </Switch>
  );
};

export default Chat;
