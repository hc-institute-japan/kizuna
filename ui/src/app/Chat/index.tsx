import React from "react";
import { Route, Switch } from "react-router";
import ChatContent from "./ChatContent";
const Chat: React.FC = () => {
  return (
    <Switch>
      <Route path="/u/:username" exact>
        <ChatContent />
      </Route>
      <Route path="/u/:username/details" exact component={ChatDetails} />
    </Switch>
  );
};

export default Chat;
