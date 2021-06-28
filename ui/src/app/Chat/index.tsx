import React from "react";
import { Route, Switch } from "react-router";
import ChatContent from "./ChatContent";
import ChatDetails from "./ChatDetails";
const Chat: React.FC = () => {
  return (
    <Switch>
      <Route path="/u/:id" exact>
        <ChatContent />
      </Route>
      <Route path="/u/:id/details" exact component={ChatDetails} />
    </Switch>
  );
};

export default Chat;
