import React from "react";
import { Route, Switch } from "react-router";
import ChatContent from "./ChatContent";
import ChatDetails from "./ChatDetails";
import ChatSearch from "./ChatSearch";
import ChatPinnedMessages from "./ChatPinnedMessages";

const RedeclaredSwitch = Switch as any;
const RedeclaredRoute = Route as any;

const Chat: React.FC = () => {
  return (
    <RedeclaredSwitch>
      <RedeclaredRoute path="/u/:id" exact>
        <ChatContent />
      </RedeclaredRoute>
      <RedeclaredRoute path="/u/:id/details" exact component={ChatDetails} />
      <RedeclaredRoute path="/u/:id/search" exact component={ChatSearch} />
      <RedeclaredRoute
        path="/u/:id/pinned"
        exact
        component={ChatPinnedMessages}
      />
    </RedeclaredSwitch>
  );
};

export default Chat;
