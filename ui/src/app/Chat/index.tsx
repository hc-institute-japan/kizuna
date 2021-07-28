import React from "react";
import { Route, Switch } from "react-router";
import ChatContent from "./ChatContent";
import ChatDetails from "./ChatDetails";
import ChatSearch from "./ChatSearch";
import ChatPinnedMessages from "./ChatPinnedMessages";

const Chat: React.FC = () => {
  return (
    <Switch>
      <Route path="/u/:id" exact>
        <ChatContent />
      </Route>
      <Route path="/u/:id/details" exact component={ChatDetails} />
      <Route path="/u/:id/search" exact component={ChatSearch} />
      <Route path="/u/:id/pinned" exact component={ChatPinnedMessages} />
    </Switch>
  );
};

export default Chat;
